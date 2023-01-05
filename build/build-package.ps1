param(
    [Parameter()]
    [ValidateSet("bug-fix", "new-feature", "upgrade")]
    [String]$mode
)

# load configuration
$config = Get-Content -Encoding UTF8 ".\build-config.json" | ConvertFrom-Json

# update version number by mode
$packageContent = Get-Content -Encoding UTF8 "../package.json"
$package = $packageContent | ConvertFrom-Json
$version = $package.version;
$versionNumbers = $version -split "\."
if ( $mode -eq "bug-fix" ) {
    $versionNumbers[2] = [int]$versionNumbers[2] + 1;
} elseif ( $mode -eq "new-feature" ) {
    $versionNumbers[1] = [int]$versionNumbers[1] + 1;
    $versionNumbers[2] = 0;
} elseif ( $mode -eq "upgrade" ) {
    $versionNumbers[0] = [int]$versionNumbers[0] + 1;
    $versionNumbers[1] = 0;
    $versionNumbers[2] = 0;
}

# confirmation
$oldVersionNumber = $version
$oldVersionText = "  `"version`": `"$version`","
$version = $versionNumbers -join "."
$newVersionText = "  `"version`": `"$version`","
Write-Host "Old Version : $oldVersionNumber => $version"
$confirmation = Read-Host "Are you sure to build new packages ?"
if ($confirmation -ne 'y') {
    exit 0
}

# update package.json and push repo
Write-Host "> Update package.json"
$packageContent = $packageContent -replace $oldVersionText, $newVersionText
$packageContent | Out-File -Encoding UTF8 "../package.json"
git add "../package.json"
git commit -m "update to version $version"
git push 2>$null

# trigger github actions workflow
Write-Host "> Building workflow ... [start]"
$requestHeaders = @{
  'Accept' = 'application/vnd.github+json'
  'X-GitHub-Api-Version' = '2022-11-28'
  'Authorization' = "Basic $($config.GithubAccessToken)"
  'Content-Type' = "application/json"
}
$request = Invoke-WebRequest -Method Post `
    -Uri https://api.github.com/repos/sige5193/bittly/dispatches `
    -Headers $requestHeaders `
    -Body '{"event_type": "build-packages","client_payload": {}}'
Write-Host "> Building workflow ... [started : $($request.StatusCode)]"