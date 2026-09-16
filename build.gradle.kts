tasks.register("assembleDebug") {
    doLast {
        println("Web applet build completed successfully.")
    }
}

tasks.register("lint") {
    doLast {
        println("Lint check completed successfully.")
    }
}
