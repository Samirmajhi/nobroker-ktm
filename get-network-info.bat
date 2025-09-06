@echo off
echo ========================================
echo No-Broker Kathmandu Network Information
echo ========================================
echo.
echo Getting your network IP address...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4 Address"') do (
    set ip=%%a
    set ip=!ip: =!
    echo Your IP Address: !ip!
    echo.
    echo Backend API: http://!ip!:5000/api/health
    echo Frontend App: http://!ip!:3000
    echo.
    echo You can access the application from other devices on your network using these URLs.
    echo.
    pause
)
