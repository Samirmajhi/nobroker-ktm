@echo off
echo ========================================
echo No-Broker Kathmandu Database Fix
echo ========================================
echo.

echo This script will help you fix the database issues.
echo.

echo 1. Make sure PostgreSQL is running
echo 2. Make sure you have psql in your PATH
echo 3. Update the database connection details below if needed
echo.

set /p DB_USER="Enter database username (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_NAME="Enter database name (default: no_broker_kathmandu): "
if "%DB_NAME%"=="" set DB_NAME=no_broker_kathmandu

echo.
echo Running database fixes...
echo.

echo Creating favorites table...
psql -U %DB_USER% -d %DB_NAME% -f database/add_favorites_table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database fixes completed successfully!
    echo.
    echo Next steps:
    echo 1. Restart your backend server
    echo 2. Test the application
    echo.
    echo If you encounter any issues, check the DATABASE_FIXES.md file.
) else (
    echo.
    echo ❌ Database fixes failed!
    echo.
    echo Please check:
    echo 1. PostgreSQL is running
    echo 2. Database credentials are correct
    echo 3. You have permission to create tables
    echo.
    echo You can also run the SQL manually from database/add_favorites_table.sql
)

echo.
pause
