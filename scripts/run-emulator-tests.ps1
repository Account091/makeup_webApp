$ErrorActionPreference = "Stop"
$env:JAVA_HOME = "C:\Users\bhawa\jdk-21\jdk-21.0.6+7"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

Write-Host "Java Version:"
& java -version

Write-Host "`nLaunching Firebase Firestore Emulator and executing test-rules-emulator.js..."
npx --yes firebase-tools emulators:exec --only firestore "node customer-web/scripts/test-rules-emulator.js"
