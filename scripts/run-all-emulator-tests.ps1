$ErrorActionPreference = "Stop"
$env:JAVA_HOME = "C:\Users\bhawa\jdk-21\jdk-21.0.6+7"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
$env:GCLOUD_PROJECT = "makeovers-by-prachi-test"
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"

Write-Host "================================================================="
Write-Host "🚀 STARTING FIREBASE EMULATORS (FIRESTORE + AUTH) & TEST RUNNER"
Write-Host "================================================================="
& java -version

npx --yes firebase-tools emulators:exec --project makeovers-by-prachi-test --only firestore,auth "node customer-web/scripts/test-rules-emulator.js && node customer-web/scripts/set-staff-claims.js && npx tsx customer-web/scripts/test-tenant-isolation-auth-emulator.ts"
