. utils/common.ps1

$vmname = "Windows 10 64-bit 开发"
$address = "192.168.43.184"
$user = "sige"
$password = ConvertTo-SecureString "sige" -AsPlainText -Force
$packageJSON = (Get-Content "../package.json") | ConvertFrom-Json
$version = $packageJson.version;
$filename = "bittly-setup-$version-win-amd64.exe"
$mode = $args[0]
if ( $mode -eq "" ) {
    $mode = "dev"
}

echo "start building vm"
VBoxManage startvm $vmname --type gui

# 等待打包虚拟机开机
echo "starting building vm"
while ( $true ) {
    Write-Host "." -NoNewLine
    Start-Sleep -s 2
    $ping = (ping -n 1 $address | Out-String);
    if ( ! $ping.Contains("请求超时") -and ! $ping.Contains("无法访问目标主机" ) ) {
        break;
    }
}
echo ""
echo "building vm started"

# 登录到虚拟机
net start winrm
Set-Item WSMan:\localhost\Client\TrustedHosts -Value $address -Force
$credent = New-Object System.Management.Automation.PSCredential($user, $password)
$session = New-PSSession -ComputerName $address -Credential $credent

# 执行打包指令
Invoke-Command -Session $session -ScriptBlock { 
    cd C:\Users\sige\Desktop\bittly\app\
    Remove-Item dist_electron -Recurse
    echo "updating ..."
    git checkout package-lock.json
    git pull
    sh .\build\utils\generate-release-notes.sh
    npm install
    echo "building ..."
    npm run electron:build
}

# 将安装包复制到本地
Copy-Item "C:\Users\sige\Desktop\bittly\app\dist_electron\$filename" `
  -Destination "..\dist_electron\$filename" -FromSession $session

# 将更新信息复制到本地
Copy-Item "C:\Users\sige\Desktop\bittly\app\dist_electron\latest.yml" `
  -Destination "..\dist_electron\latest.yml" -FromSession $session

# 关闭 虚拟机
Invoke-Command -Session $session -ScriptBlock { Stop-Computer -Force }

# 删除会话
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