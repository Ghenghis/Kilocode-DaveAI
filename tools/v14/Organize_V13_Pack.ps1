# Organize_V13_Pack.ps1
Set-Location $PSScriptRoot
Write-Host "--- KiloCode V13 TTS Execution Pack: Folder Organizer ---" -ForegroundColor Cyan
$folders = @(
    "00_INDEX",
    "01_NEW_SOURCE_FILES",
    "01_NEW_SOURCE_FILES/providers",
    "02_FILE_PATCHES",
    "03_TESTS/playwright",
    "03_TESTS/unit",
    "03_TESTS/integration",
    "04_PHASE_GATES/phase-00",
    "04_PHASE_GATES/phase-01",
    "04_PHASE_GATES/phase-02",
    "04_PHASE_GATES/phase-03",
    "05_GUARD_RAILS",
    "06_LOGGING_AND_DEBUG",
    "07_AGENT_RUNBOOK"
)
foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -Path $folder -ItemType Directory | Out-Null
    }
}
$fileMapping = @{
    "PASS_CHECKLIST.md"     = "04_PHASE_GATES/phase-00/PASS_CHECKLIST.md"
    "PASS_CHECKLIST (1).md" = "04_PHASE_GATES/phase-01/PASS_CHECKLIST.md"
    "PASS_CHECKLIST (4).md" = "04_PHASE_GATES/phase-02/PASS_CHECKLIST.md"
    "PASS_CHECKLIST (2).md" = "04_PHASE_GATES/phase-03/PASS_CHECKLIST.md"
    "TtsTypes.ts"           = "01_NEW_SOURCE_FILES/TtsTypes.ts"
    "TtsProviderFactory.ts" = "01_NEW_SOURCE_FILES/TtsProviderFactory.ts"
    "KiloProvider.patch.md" = "02_FILE_PATCHES/KiloProvider.patch.md"
    "package-json.patch.md" = "02_FILE_PATCHES/package-json.patch.md"
    "MASTER_INDEX.md"       = "00_INDEX/MASTER_INDEX.md"
}
$successCount = 0
$failCount = 0
foreach ($source in $fileMapping.Keys) {
    $destination = $fileMapping[$source]
    if (Test-Path $source) {
        try {
            Move-Item -Path $source -Destination $destination -Force -ErrorAction Stop
            $successCount++
        }
        catch {
            $failCount++
        }
    }
}
Write-Host "Files Successfully Organized: $successCount" -ForegroundColor Green
if ($failCount -gt 0) { Write-Host "Files Failed to Move: $failCount" -ForegroundColor Red }