. utils/common.ps1

$vmname = "Ubuntu 20.04 64-bit 开发"
$address = "192.168.43.96"
$user = "sige"
$password = ConvertTo-SecureString "sige" -AsPlainText -Force
$packageJSON = (Get-Content "../package.json") | ConvertFrom-Json
$version = $packageJson.version;
$filename = "bittly-$version-x86_64.AppImage"

# 启动打包虚拟机
echo "start building vm"
VBoxManage startvm $vmname --type gui

# 等待打包虚拟机开机
wait-for-build-server-ready $address

# 打包
$depCommands = @()
$depCommands += "cd /home/sige/projects/bittly/app";
$depCommands += "git checkout package-lock.json";
$depCommands += "git pull";
$depCommands += "chmod u+x ./build/utils/generate-release-notes.sh"
$depCommands += "./build/utils/generate-release-notes.sh"
$depCommands += "export PATH=`$PATH:/home/sige/applications/node/bin/"
$depCommands += "npm install"
$depCommands += "npm run electron:build"
$depCommands = $depCommands -join ";"
ssh $user@$address $depCommands

# 将打包好的运行文件下载到本地
echo "get /home/sige/projects/bittly/app/dist_electron/$filename" | sftp $user@$address
if ( Test-Path ../dist_electron/$filename ) {
    Remove-Item ../dist_electron/$filename
}
Move-Item -Path $filename -Destination ../dist_electron

# 下载更新文件
echo "get /home/sige/projects/bittly/app/dist_electron/latest-linux.yml" | sftp $user@$address
if ( Test-Path ../dist_electron/latest-linux.yml ) {
    Remove-Item ../dist_electron/latest-linux.yml
}
Move-Item -Path latest-linux.yml -Destination ../dist_electron

# 关闭 虚拟机
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
