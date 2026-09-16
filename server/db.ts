import { DatabaseSync } from "node:sqlite";
import { Pool } from "pg";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { REAL_BENIN_HOSPITALS, REAL_BENIN_PHARMACIES } from "./beninHealthData.ts";

// =====================================================================
// CHOIX DU MOTEUR DE BASE DE DONNÉES
// =====================================================================
const DB_URL = process.env.DATABASE_URL;
const isPostgres = DB_URL && DB_URL.startsWith("postgresql://");

let sqliteDb: DatabaseSync | null = null;
let pgPool: Pool | null = null;

if (isPostgres) {
  pgPool = new Pool({ connectionString: DB_URL, max: 20 });
  pgPool.on("error", (err) => console.error("[PG-POOL] Error:", err));
} else {
  const dbPath = DB_URL || path.join(process.cwd(), "data", "sante_production.sqlite");
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
  `);
}

// =====================================================================
// WRAPPER SQLITE-COMPATIBLE (PG ou SQLite)
// =====================================================================
type Params = (string | number | Date | Buffer | null | boolean)[];
interface Statement {
  get: (...params: Params) => Promise<any>;
  run: (...params: Params) => Promise<any>;
  all: (...params: Params) => Promise<any[]>;
}

function convertPlaceholders(sql: string): string {
  let idx = 1;
  return sql.replace(/\?/g, () => `$${idx++}`);
}

function stmt(sql: string): Statement {
  const query = convertPlaceholders(sql);
  return {
    get: async (...params: Params) => {
      if (isPostgres && pgPool) {
        const res = await pgPool.query(query, params);
        return res.rows[0] || null;
      } else if (sqliteDb) {
        const res = sqliteDb.prepare(query).get(...params);
        return res;
      }
      return null;
    },
    run: async (...params: Params) => {
      if (isPostgres && pgPool) {
        await pgPool.query(query, params);
        return { changes: 1 };
      } else if (sqliteDb) {
        sqliteDb.prepare(query).run(...params);
        return { changes: 1 };
      }
      return { changes: 0 };
    },
    all: async (...params: Params) => {
      if (isPostgres && pgPool) {
        const res = await pgPool.query(query, params);
        return res.rows;
      } else if (sqliteDb) {
        const res = sqliteDb.prepare(query).all(...params);
        return res;
      }
      return [];
    },
  };
}

export const db = {
  prepare: stmt,
  exec: async (sql: string): Promise<void> => {
    if (isPostgres && pgPool) {
      const client = await pgPool.connect();
      try { await client.query(sql); } finally { client.release(); }
    } else if (sqliteDb) {
      sqliteDb.exec(sql);
    }
  },
};

// =====================================================================
// SCHEMA DE BASE DE DONNÉES
// =====================================================================
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'hospital', 'admin')),
    is_active INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0,
    two_factor_enabled INTEGER DEFAULT 0,
    last_login TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('M', 'F', 'A')),
    npi TEXT UNIQUE NOT NULL,
    blood_type TEXT,
    allergies TEXT,
    qr_code_hash TEXT UNIQUE,
    qr_link TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    npi TEXT UNIQUE,
    hospital_id TEXT,
    license_number TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('national', 'department', 'zone', 'private', 'clinic')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    department TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    phone TEXT,
    email TEXT,
    specialties TEXT,
    has_emergency INTEGER DEFAULT 0,
    has_blood_bank INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS pharmacies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    department TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    phone TEXT,
    is_on_duty INTEGER DEFAULT 0,
    duty_start_date TEXT,
    duty_end_date TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    function TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('doctor', 'hospital')),
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    motif TEXT NOT NULL,
    profession TEXT,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    amount_cfa INTEGER DEFAULT 0,
    payment_method TEXT,
    paid INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'arrived', 'completed', 'cancelled')) DEFAULT 'pending',
    qr_code TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS consultation_records (
    id TEXT PRIMARY KEY,
    appointment_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    motif TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    prescription TEXT NOT NULL,
    notes TEXT,
    vitals TEXT,
    status TEXT NOT NULL CHECK(status IN ('draft', 'validated')) DEFAULT 'draft',
    blockchain_hash TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    related_type TEXT,
    related_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    doctor_id TEXT,
    appointment_id TEXT,
    items TEXT NOT NULL,
    total_xof INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    payment_method TEXT CHECK(payment_method IN ('mtn', 'moov', 'breez')),
    payment_hash TEXT,
    paid_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    invoice_id TEXT,
    amount_xof INTEGER NOT NULL,
    amount_sats INTEGER,
    method TEXT NOT NULL CHECK(method IN ('mtn', 'moov', 'breez')),
    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_id TEXT UNIQUE NOT NULL,
    payment_hash TEXT,
    provider_response TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
  CREATE INDEX IF NOT EXISTS idx_patients_npi ON patients(npi);
  CREATE INDEX IF NOT EXISTS idx_patients_qr ON patients(qr_code_hash);
  CREATE INDEX IF NOT EXISTS idx_doctors_npi ON doctors(npi);
  CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
  CREATE INDEX IF NOT EXISTS idx_hospitals_dept ON hospitals(department);
  CREATE INDEX IF NOT EXISTS idx_hospitals_type ON hospitals(type);
  CREATE INDEX IF NOT EXISTS idx_pharmacies_city ON pharmacies(city);
  CREATE INDEX IF NOT EXISTS idx_pharmacies_dept ON pharmacies(department);
  CREATE INDEX IF NOT EXISTS idx_pharmacies_duty ON pharmacies(is_on_duty);
  CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
  CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
  CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultation_records(patient_id);
  CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultation_records(doctor_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
  CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
  CREATE INDEX IF NOT EXISTS idx_transactions_txid ON transactions(transaction_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
  CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON transactions(invoice_id);
`;

export async function initDatabase(): Promise<void> {
  await db.exec(SCHEMA_SQL);

  if (!isPostgres && sqliteDb) {
    const hospitalCount = (sqliteDb.prepare("SELECT COUNT(*) as count FROM hospitals").get() as { count: number }).count;
    if (hospitalCount === 0) {
      const now = new Date().toISOString();
      const insertHosp = sqliteDb.prepare(`
        INSERT INTO hospitals (id, name, type, address, city, department, latitude, longitude, phone, email, specialties, has_emergency, has_blood_bank, capacity, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const h of REAL_BENIN_HOSPITALS) {
        insertHosp.run(h.id, h.name, h.type, h.address, h.city, h.department, h.latitude, h.longitude, h.phone, h.email, JSON.stringify(h.specialties), h.has_emergency ? 1 : 0, h.has_blood_bank ? 1 : 0, h.capacity, now);
      }
      console.log(`[DB-SEED] ${REAL_BENIN_HOSPITALS.length} hôpitaux insérés.`);
    }

    const pharmacyCount = (sqliteDb.prepare("SELECT COUNT(*) as count FROM pharmacies").get() as { count: number }).count;
    if (pharmacyCount === 0) {
      const now = new Date().toISOString();
      const insertPharm = sqliteDb.prepare(`
        INSERT INTO pharmacies (id, name, address, city, department, latitude, longitude, phone, is_on_duty, duty_start_date, duty_end_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of REAL_BENIN_PHARMACIES) {
        insertPharm.run(p.id, p.name, p.address, p.city, p.department, p.latitude, p.longitude, p.phone, p.is_on_duty ? 1 : 0, p.duty_start_date, p.duty_end_date, now);
      }
      console.log(`[DB-SEED] ${REAL_BENIN_PHARMACIES.length} pharmacies insérées.`);
    }

    const adminCheck = sqliteDb.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
    if (!adminCheck) {
      const adminId = crypto.randomUUID();
      const now = new Date().toISOString();
      const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || "BeninSante2026!";
      const passwordHash = bcrypt.hashSync(defaultPassword, 12);
      sqliteDb.prepare(`
        INSERT INTO users (id, email, phone, password_hash, role, is_active, is_verified, two_factor_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', 1, 1, 1, ?, ?)
      `).run(adminId, "admin.sante@gouv.bj", "0195000001", passwordHash, now, now);
      console.log("[DB-SEED] Admin créé.");
    }

    const doctorCheck = sqliteDb.prepare("SELECT id FROM users WHERE role = 'doctor' LIMIT 1").get();
    if (!doctorCheck) {
      const userId = crypto.randomUUID();
      const doctorId = crypto.randomUUID();
      const now = new Date().toISOString();
      const defaultPassword = process.env.DOCTOR_INITIAL_PASSWORD || "MedecinSante2026!";
      const passwordHash = bcrypt.hashSync(defaultPassword, 12);
      sqliteDb.prepare(`
        INSERT INTO users (id, email, phone, password_hash, role, is_active, is_verified, two_factor_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, 'doctor', 1, 1, 0, ?, ?)
      `).run(userId, "medecin.sante@benin.local", "0195000002", passwordHash, now, now);
      sqliteDb.prepare(`
        INSERT INTO doctors (id, user_id, first_name, last_name, specialty, npi, hospital_id, license_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(doctorId, userId, "Dr. Marcel", "Dossou", "Médecine générale", "BEN-DR-001", null, "ONMB-BJ-DR-001", now);
      console.log("[DB-SEED] Médecin créé.");
    }

    const hospitalUserCheck = sqliteDb.prepare("SELECT id FROM users WHERE role = 'hospital' LIMIT 1").get();
    if (!hospitalUserCheck) {
      const userId = crypto.randomUUID();
      const hospitalId = crypto.randomUUID();
      const now = new Date().toISOString();
      const defaultPassword = process.env.HOSPITAL_INITIAL_PASSWORD || "HopitalSante2026!";
      const passwordHash = bcrypt.hashSync(defaultPassword, 12);
      sqliteDb.prepare(`
        INSERT INTO users (id, email, phone, password_hash, role, is_active, is_verified, two_factor_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, 'hospital', 1, 1, 0, ?, ?)
      `).run(userId, "hopital.sante@benin.local", "0195000003", passwordHash, now, now);
      sqliteDb.prepare(`
        INSERT INTO hospitals (id, user_id, name, type, address, city, department, latitude, longitude, phone, email, specialties, has_emergency, has_blood_bank, capacity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(hospitalId, userId, "Centre Hospitalier Universitaire de Cotonou", "national", "Avenue de la Clinique, Cotonou", "Cotonou", "Littoral", 6.3703, 2.3903, "0195000003", "hopital.sante@benin.local", JSON.stringify(["Urgences", "Médecine interne", "Pédiatrie"]), 1, 1, 320, now);
      console.log("[DB-SEED] Hôpital créé.");
    }
  } else if (isPostgres && pgPool) {
    // PostgreSQL seeding
    const client = await pgPool.connect();
    try {
      const hospitalCount = (await client.query("SELECT COUNT(*) as count FROM hospitals")).rows[0].count;
      if (parseInt(hospitalCount) === 0) {
        const now = new Date().toISOString();
        for (const h of REAL_BENIN_HOSPITALS) {
          await client.query(`
            INSERT INTO hospitals (id, name, type, address, city, department, latitude, longitude, phone, email, specialties, has_emergency, has_blood_bank, capacity, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          `, [h.id, h.name, h.type, h.address, h.city, h.department, h.latitude, h.longitude, h.phone, h.email, JSON.stringify(h.specialties), h.has_emergency ? 1 : 0, h.has_blood_bank ? 1 : 0, h.capacity, now]);
        }
        console.log(`[DB-SEED] ${REAL_BENIN_HOSPITALS.length} hôpitaux insérés.`);
      }
      const adminCheck = (await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")).rows;
      if (adminCheck.length === 0) {
        const adminId = crypto.randomUUID();
        const now = new Date().toISOString();
        const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || "BeninSante2026!";
        const passwordHash = bcrypt.hashSync(defaultPassword, 12);
        await client.query(`INSERT INTO users (id, email, phone, password_hash, role, is_active, is_verified, two_factor_enabled, created_at, updated_at) VALUES ($1, $2, $3, $4, 'admin', 1, 1, 1, $5, $6)`, [adminId, "admin.sante@gouv.bj", "0195000001", passwordHash, now, now]);
      }
    } finally {
      client.release();
    }
  }

  console.log("[DB-INIT] Base de données initialisée.");
}

export async function logAudit(userId: string | null, action: string, details: string, ip: string = "unknown"): Promise<void> {
  try {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    await db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, details, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, action, details, ip, timestamp);
  } catch (err) {
    console.error("Erreur log audit:", err);
  }
}

export async function closeDatabase(): Promise<void> {
  try { if (pgPool) { await pgPool.end(); pgPool = null; } } catch {}
  try { if (sqliteDb) { sqliteDb.close(); sqliteDb = null; } } catch {}
}
