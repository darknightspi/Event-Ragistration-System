# PowerShell script to kill process on port 3000
$port = 3000
$processes = netstat -ano | findstr ":$port"

if ($processes) {
    $processes | ForEach-Object {
        $parts = $_ -split '\s+'
        $pid = $parts[-1]
        if ($pid -match '^\d+$') {
            Write-Host "Killing process $pid on port $port"
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Host "Port $port is now free!"
} else {
    Write-Host "Port $port is already free."
}

