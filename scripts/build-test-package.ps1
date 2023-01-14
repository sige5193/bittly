# 
# build test package and download it test folder
#
$packKey = Get-Date -Format "yyyyMMddHHmmss"
Write-Host "Package Key : ${packKey}"

# start workflow
Write-Host ""
Write-Host "Start workflow ..."
gh workflow run "Build Test Package" --repo sige5193/bittly -f packey=$packKey
if ( $false -eq $? ) {
   return ;
}

# delay 3 seconds
Start-Sleep -s 3

# watch workflow job
$jobs = gh run list --repo sige5193/bittly --user sige5193 --limit 1 --json databaseId
$config = $jobs | ConvertFrom-Json
$jobId = $config[0].databaseId
gh run watch $jobId --repo sige5193/bittly --exit-status
if ( $false -eq $? ) {
   return ;
}

# download package
Write-Host ""
Write-Host "Downloading ..."
./scripts/qshell get sige-test bittly/bittly-x64-$packKey.exe `
  --domain test.assets.sigechen.com `
  --outfile bittly-x64-$packKey.exe `
  --silence 
./scripts/qshell delete sige-test bittly/bittly-x64-$packKey.exe

# delete uploaded package
Write-Host ""
Write-Host "File Downloaded : bittly-x64-$packKey.exe"