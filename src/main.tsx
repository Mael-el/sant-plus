import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

// Enregistrement PWA Service Worker pour le mode hors-ligne et l'installation
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SANTÉ+ PWA Service Worker actif:", reg.scope);
      })
      .catch((err) => {
        console.warn("Service Worker non disponible:", err);
      });
  });
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
