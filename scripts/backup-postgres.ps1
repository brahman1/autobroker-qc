param(
  [string]$Container = 'autobroker-postgres',
  [string]$Database = 'autobroker_db',
  [string]$User = 'autobroker'
)

$backupDirectory = Join-Path $PSScriptRoot '..\backups'
New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputPath = Join-Path $backupDirectory "autobroker-$timestamp.sql"
docker exec $Container pg_dump -U $User $Database | Out-File -FilePath $outputPath -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw 'La sauvegarde PostgreSQL a échoué.' }
Write-Output "Sauvegarde créée : $outputPath"
