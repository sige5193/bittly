. utils/common.ps1
$user = 'pi'
$address = "192.168.43.165"
$packageJSON = (Get-Content "../package.json") | ConvertFrom-Json
$version = $packageJson.version;
$filename = "bittly-$version-armv7l.AppImage"

wait-for-build-server-ready $address

# # build package
# $depCommands = @()
# $depCommands += "cd /home/pi/projects/bittly/app";
# $depCommands += "git checkout package-lock.json";
# $depCommands += "git pull";
# $depCommands += "export PATH=`$PATH:/usr/local/node/bin/"
# $depCommands += "chmod u+x ./build/utils/generate-release-notes.sh"
# $depCommands += "./build/utils/generate-release-notes.sh"
# $depCommands += "npm install"
# $depCommands += "cd node_modules/@serialport/bindings-cpp"
# $depCommands += "node-gyp rebuild --traget=17.0.0 --arch=arm --dist-url=https://electronjs.org/headers"
# $depCommands += "cd ../../../"
# $depCommands += "npm run electron:build -- --armv7l"
# $depCommands = $depCommands -join ";"
# ssh $user@$address $depCommands

# 将打包好的运行文件下载到本地
echo "get /home/pi/projects/bittly/app/dist_electron/$filename" | sftp $user@$address
if ( Test-Path ../dist_electron/$filename ) {
    Remove-Item ../dist_electron/$filename
}
Move-Item -Path $filename -Destination ../dist_electron

# 下载更新文件
echo "get /home/pi/projects/bittly/app/dist_electron/latest-linux-arm.yml" | sftp $user@$address
if ( Test-Path ../dist_electron/latest-linux-arm.yml ) {
    Remove-Item ../dist_electron/latest-linux-arm.yml
}
Move-Item -Path latest-linux-arm.yml -Destination ../dist_electron

upload-latest-yml "latest-linux-arm.yml"
upload-package-to-cdn $filename

# # update service info
update-server-runtime-variable 'linux_arm_appimage_version' $version

$filesize = [string]::Format("{0:0.00}MB",(Get-Item "../dist_electron/$filename").Length / 1024 / 1024)
update-server-runtime-variable 'linux_arm_appimage_size' $filesize

$releaseDate = (Get-Date -Format yyyy-MM-dd);
update-server-runtime-variable 'linux_arm_appimage_released_at' $releaseDate

Write-Host ""
Write-Host ""
Write-Host "Build Package Success"
Write-Host "> Version : $version"
Write-Host "> File Name : $filename"
Write-Host "> File Size : $filesize"
Write-Host "> Release Date : $releaseDate"
Write-Host "> CDN Link : https://res.bittly.sigechen.com/download/$version/$filename"
