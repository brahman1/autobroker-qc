param([string]$Time = '02:00')

$root = Split-Path -Parent $PSScriptRoot
$script = Join-Path $PSScriptRoot 'backup-postgres.ps1'
$taskName = 'AutoBrokerQC-PostgreSQL-Backup'
$command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$script`""
schtasks /Create /TN $taskName /TR $command /SC DAILY /ST $Time /F
if ($LASTEXITCODE -ne 0) { throw 'Impossible de créer la tâche de sauvegarde.' }
Write-Output "Tâche planifiée créée : $taskName, chaque jour à $Time."
