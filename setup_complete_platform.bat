@echo off
echo ========================================
echo No-Broker Kathmandu - Complete Setup
echo ========================================
echo.

echo This script will set up the complete platform with all features.
echo.

echo 1. Setting up database tables...
echo.

set /p DB_USER="Enter database username (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_NAME="Enter database name (default: no_broker_kathmandu): "
if "%DB_NAME%"=="" set DB_NAME=no_broker_kathmandu

echo.
echo Creating all required tables...

echo Creating favorites table...
psql -U %DB_USER% -d %DB_NAME% -f database/add_favorites_table.sql

echo Creating listing_views table...
psql -U %DB_USER% -d %DB_NAME% -f database/add_listing_views_table.sql

echo Creating listing_photos table...
psql -U %DB_USER% -d %DB_NAME% -f database/add_listing_photos_table.sql

echo Creating messaging tables...
psql -U %DB_USER% -d %DB_NAME% -f database/add_messaging_tables.sql

echo.
echo 2. Creating uploads directory...
if not exist "backend\uploads\listings" mkdir "backend\uploads\listings"

echo.
echo 3. Platform Features Implemented:
echo    ✅ Role-based access control (Owner, Tenant, Staff, Admin)
echo    ✅ KYC verification system
echo    ✅ Property listing with photo uploads
echo    ✅ Real-time messaging system
echo    ✅ Visit scheduling
echo    ✅ Favorites system
echo    ✅ Analytics and reporting
echo    ✅ Staff dashboard
echo    ✅ Owner dashboard
echo    ✅ Tenant dashboard
echo    ✅ Admin dashboard
echo.

echo 4. User Roles and Permissions:
echo.
echo    OWNER:
echo    - Create and manage property listings
echo    - Requires KYC verification
echo    - View analytics and performance
echo    - Manage visits and messages
echo    - Upload property photos
echo.
echo    TENANT:
echo    - Browse and search properties
echo    - Schedule property visits
echo    - Message property owners
echo    - Save favorite properties
echo    - View visit history
echo.
echo    STAFF:
echo    - Manage property visits
echo    - Handle user support
echo    - Verify property listings
echo    - Access staff dashboard
echo    - Moderate conversations
echo.
echo    ADMIN:
echo    - Full platform access
echo    - User management
echo    - System analytics
echo    - Content moderation
echo    - Platform configuration
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Platform setup completed successfully!
    echo.
    echo Next steps:
    echo 1. Start backend: cd backend && npm run dev
    echo 2. Start frontend: cd frontend && npm start
    echo 3. Visit http://localhost:3000
    echo.
    echo Demo accounts:
    echo - Tenant: tenant@test.com / password123
    echo - Owner: owner@test.com / password123
    echo - Admin: admin@nobroker.com / password123
    echo.
    echo Features to test:
    echo - Create listings (as owner with KYC)
    echo - Browse properties and message owners (as tenant)
    echo - Staff dashboard and visit management
    echo - Real-time messaging system
    echo - Photo uploads and galleries
    echo.
) else (
    echo.
    echo ❌ Setup failed!
    echo.
    echo Please check:
    echo 1. PostgreSQL is running
    echo 2. Database credentials are correct
    echo 3. You have permission to create tables
    echo.
)

echo.
pause
