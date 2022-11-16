##
# build app installer for ubuntu.
# To build test package, run `./build-ubuntu.ps1`
##
. utils/common.ps1
$config = (Get-Content "build-config.json") | ConvertFrom-Json

$vmname = $config.ubuntu.vmname;
$address = $config.ubuntu.address;
$user = $config.ubuntu.user;
$workpath = $config.ubuntu.workpath;
$packageJSON = (Get-Content "../package.json") | ConvertFrom-Json
$version = $packageJson.version;
$filename = "bittly-$version-x86_64.AppImage"

# start build vm
echo "start building vm"
VBoxManage startvm $vmname --type gui
wait-for-connection-available $address 22

# build app package
$depCommands = @()
$depCommands += "cd ${workpath}";
$depCommands += "git checkout package-lock.json";
$depCommands += "git pull";
$depCommands += "export PATH=`$PATH:/usr/local/node/bin"
$depCommands += "npm install"
$depCommands += "npm run electron:build"
$depCommands = $depCommands -join ";"
ssh $user@$address $depCommands

# copy package to local
echo "get ${workpath}/dist_electron/$filename" | sftp $user@$address
if ( Test-Path ../dist_electron/$filename ) {
    Remove-Item ../dist_electron/$filename
}
Move-Item -Path $filename -Destination ../dist_electron

# copy update file to local
echo "get ${workpath}/dist_electron/latest-linux.yml" | sftp $user@$address
if ( Test-Path ../dist_electron/latest-linux.yml ) {
    Remove-Item ../dist_electron/latest-linux.yml
}
Move-Item -Path latest-linux.yml -Destination ../dist_electron

# close builder vm
ssh $user@$address "sudo poweroff"

upload-latest-yml "latest-linux.yml"
upload-package-to-cdn $filename

# update service info
update-server-runtime-variable 'linux_ubuntu_appimage_version' $version

$filesize = [string]::Format("{0:0.00}MB",(Get-Item "../dist_electron/$filename").Length / 1024 / 1024)
update-server-runtime-variable 'linux_ubuntu_appimage_size' $filesize

$releaseDate = (Get-Date -Format yyyy-MM-dd);
update-server-runtime-variable 'linux_ubuntu_appimage_released_at' $releaseDate

Write-Host ""
Write-Host ""
Write-Host "Build Package Success"
Write-Host "> Version : $version"
Write-Host "> File Name : $filename"
Write-Host "> File Size : $filesize"
Write-Host "> Release Date : $releaseDate"
Write-Host "> CDN Link : https://res.bittly.sigechen.com/download/$version/$filename"
