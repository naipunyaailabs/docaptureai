@echo off
REM Docapture Quick Start Script for Windows
REM This script helps you quickly deploy the Docapture application

echo =========================================
echo   Docapture Deployment Script
echo =========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo + Docker and Docker Compose are installed
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.docker .env
    echo ! Please edit .env file with your configuration before continuing.
    echo   Press any key when ready...
    pause >nul
)

REM Ask for deployment type
echo Select deployment type:
echo 1) Development (with exposed ports)
echo 2) Production (with Nginx and SSL)
set /p choice="Enter choice [1-2]: "

if "%choice%"=="1" (
    echo.
    echo Starting Development Environment...
    echo.
    
    REM Build and start services
    docker-compose build
    docker-compose up -d
    
    echo.
    echo + Development environment started!
    echo.
    echo Access points:
    echo    Frontend: http://localhost:3000
    echo    Backend:  http://localhost:5000
    echo    MongoDB:  localhost:27017
    echo.
    echo View logs: docker-compose logs -f
    echo Stop: docker-compose down
) else if "%choice%"=="2" (
    echo.
    echo Starting Production Environment...
    echo.
    
    REM Check for SSL certificates
    if not exist nginx\ssl\cert.pem (
        echo ! SSL certificates not found. You need to generate them manually.
        echo.
        echo Run this command in Git Bash or WSL:
        echo mkdir -p nginx/ssl
        echo openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
            -keyout nginx/ssl/key.pem ^
            -out nginx/ssl/cert.pem ^
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        echo.
        pause
        exit /b 1
    )
    
    REM Check for production env file
    if not exist .env.production (
        echo ! .env.production not found. Using .env
        set ENV_FILE=.env
    ) else (
        set ENV_FILE=.env.production
    )
    
    REM Build and start production services
    docker-compose -f docker-compose.prod.yml --env-file %ENV_FILE% build
    docker-compose -f docker-compose.prod.yml --env-file %ENV_FILE% up -d
    
    echo.
    echo + Production environment started!
    echo.
    echo Access points:
    echo    HTTPS: https://localhost
    echo    HTTP:  http://localhost (redirects to HTTPS)
    echo.
    echo View logs: docker-compose -f docker-compose.prod.yml logs -f
    echo Stop: docker-compose -f docker-compose.prod.yml down
) else (
    echo X Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo =========================================
echo   Deployment Complete!
echo =========================================
pause
