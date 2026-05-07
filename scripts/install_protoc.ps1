$ErrorActionPreference = 'Stop'

$ProtocVersion = "25.2"
$ProtocZip = "protoc-$ProtocVersion-win64.zip"
$ProtocUrl = "https://github.com/protocolbuffers/protobuf/releases/download/v$ProtocVersion/$ProtocZip"

$WorkspaceDir = "d:\PROJECT _FS\livesysdesign"
$BinDir = "$WorkspaceDir\bin"
$ZipPath = "$WorkspaceDir\$ProtocZip"

if (!(Test-Path $BinDir)) {
    New-Item -ItemType Directory -Force -Path $BinDir | Out-Null
}

Write-Host "Downloading protoc $ProtocVersion..."
Invoke-WebRequest -Uri $ProtocUrl -OutFile $ZipPath

Write-Host "Extracting protoc..."
Expand-Archive -Path $ZipPath -DestinationPath $BinDir -Force

Write-Host "Cleaning up..."
Remove-Item -Path $ZipPath -Force

Write-Host "Protoc downloaded successfully to $BinDir\bin\protoc.exe"
