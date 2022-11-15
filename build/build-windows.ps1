##
# build app installer for windows.
# To build test package, run `./build-windows.ps1`, or `./build-windows.ps1 prod` for
# production package. 
##
. utils/common.ps1
$config = (Get-Content "build-config.json") | ConvertFrom-Json

$vmname = $config.windows.vmname;
$address = $config.windows.address;
$winrmPort = $config.windows.port;
$user = $config.windows.user;
$password = ConvertTo-SecureString  $config.windows.password -AsPlainText -Force
$packageJSON = (Get-Content "../package.json") | ConvertFrom-Json
$workpath = $config.windows.workpath;
$version = $packageJson.version;
$filename = "bittly-setup-$version-win-amd64.exe"
$mode = $args[0]
if ( $mode -eq "" ) {
    $mode = "dev"
}

echo "start building vm"
VBoxManage startvm $vmname --type gui
wait-for-connection-available $address $winrmPort

# login to build server
net start winrm
Set-Item WSMan:\localhost\Client\TrustedHosts -Value $address -Force
$credent = New-Object System.Management.Automation.PSCredential($user, $password)
$session = New-PSSession -ComputerName $address -Credential $credent

# build app
Invoke-Command -Session $session -ScriptBlock { 
    cd $Using:workpath
    Remove-Item dist_electron -Recurse
    echo "> update source code"
    git checkout package-lock.json
    git pull
    echo "> install packages"
    npm install
    echo "> build app package"
    npm run electron:build
} 2>$null

# copy installer package to local
Copy-Item "$workpath\dist_electron\$filename" `
  -Destination "..\dist_electron\$filename" -FromSession $session

# copy update info to local 
Copy-Item "$workpath\dist_electron\latest.yml" `
  -Destination "..\dist_electron\latest.yml" -FromSession $session

# close build vm
Invoke-Command -Session $session -ScriptBlock { Stop-Computer -Force }

# delete winrm session
Disconnect-PSSession -Session $session

upload-package-to-cdn $filename
upload-latest-yml "latest.yml"

if ( $mode -eq "prod" ) {
    # update service info
    update-server-runtime-variable 'windows_installer_version' $version

    $filesize = [string]::Format("{0:0.00}MB",(Get-Item "../dist_electron/$filename").Length / 1024 / 1024)
    update-server-runtime-variable 'windows_installer_size' $filesize

    $releaseDate = (Get-Date -Format yyyy-MM-dd);
    update-server-runtime-variable 'windows_installer_released_date' $releaseDate
}

Write-Host ""
Write-Host ""
Write-Host "Build Package Success"
Write-Host "> Version : $version"
Write-Host "> File Name : $filename"
Write-Host "> File Size : $filesize"
Write-Host "> Release Date : $releaseDate"
Write-Host "> CDN Link : https://res.bittly.sigechen.com/download/$version/$filename"