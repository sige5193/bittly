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
    [void][System.Reflection.Assembly]::LoadWithPartialName("MySql.Data")
    $connection = New-Object MySql.Data.MySqlClient.MySqlConnection
    $connection.ConnectionString = "Server=106.15.62.251;Uid=bittlydep;Pwd=FpHWhG3DHbCtwHbDn1DfdicYue6Q;database=bittly;"
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
    while ( $true ) {
        Write-Host "." -NoNewLine
        Start-Sleep -s 2
        if ( Test-Connection $address -Count 1 -Quiet ) {
            break;
        }
    }
    Write-Host ""
}