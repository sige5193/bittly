# 
# build production packages
#

# start workflow
Write-Host ""
Write-Host "Start workflow ..."
gh workflow run "Build App Packages" --repo sige5193/bittly
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

# Done
Write-Host ""