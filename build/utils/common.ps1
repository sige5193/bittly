# upload latest.yml file to server
# @param [String] $filename
function upload-latest-yml ( $filename )  {
    Write-Host "uploading $filename to server"

    $package = (Get-Content "../package.json") | ConvertFrom-Json
    $version = $package.version;

    # replace download url to CDN
    $updateContent = Get-Content -Encoding UTF8 "..\dist_electron\$filename"
    $updateContent = $updateContent -replace `
        "  - url: (.*?)", `
        "  - url: https://res.bittly.sigechen.com/download/$version/$1"
    $updateContent | Out-File -Encoding UTF8 "..\dist_electron\$filename"

    # upload file to server
    echo "put ../dist_electron/$filename /usr/local/bittly/server/web/app-update" | sftp root@bittly.sigechen.com
    chcp 936 | Out-Null
}

# upload package file to qiniu cdn
# @param [String] $filename
function upload-package-to-cdn ( $filename ) {
    Write-Host "upload installer to cdn"

    $package = (Get-Content "../package.json") | ConvertFrom-Json
    $version = $package.version;

    ./qshell fput assets-bittly-sigechen-com `
        download/$version/$filename `
        ../dist_electron/$filename
}

# update server runtime variable 
# @param [String] $name
# @param [String] $value
function update-server-runtime-variable ( $name, $value ) {
    $config = (Get-Content "build-config.json") | ConvertFrom-Json
    
    [void][System.Reflection.Assembly]::LoadWithPartialName("MySql.Data")
    $connection = New-Object MySql.Data.MySqlClient.MySqlConnection
    $connection.ConnectionString = "Server=$($config.server.dbAddress);Uid=$($config.server.dbUser);Pwd=$($config.server.dbPasswd);database=$(config.server.dbName);"
    $connection.Open()

    $insertcommand = New-Object MySql.Data.MySqlClient.MySqlCommand
    $insertcommand.Connection=$connection
    $insertcommand.CommandText="UPDATE bittly_runtime_variables SET value='$value' WHERE bittly_runtime_variables.key='$name'"
    $result = $insertcommand.ExecuteNonQuery()

    $connection.Close()
}

# wait for build server ready 
# @param [String] $address
function wait-for-build-server-ready ($address) {
    Write-Host "waiting for build server ready " -NoNewLine

    $ping = New-Object System.Net.NetworkInformation.Ping
    while ( $true ) {
        Write-Host "." -NoNewLine
        Start-Sleep -s 2
        $pingResult = $ping.send($address);
        if ( $pingResult.Status -eq "Success" ) {
            break;
        }
    }
    Write-Host ""
}

# wait for network connection available
# @param [String] $address
# @param [Integer] $port
function wait-for-connection-available( $address, $port ) {
    Write-Host "waiting for connection available : ${address}:${port} " -NoNewLine

    $timeout = 1000;
    while ( $true ) {
        Write-Host "." -NoNewLine
        
        $requestCallback = $state = $null
        $client = New-Object System.Net.Sockets.TcpClient
        $beginConnect = $client.BeginConnect($address,$port,$requestCallback,$state)
        Start-Sleep -milli $timeOut
        if ($client.Connected) { 
            $client.Close()
            break
        }
    }
    Write-Host ""
}