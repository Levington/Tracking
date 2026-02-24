@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════╗
echo ║     🏠 FamilyHub Server Startup      ║
echo ╚═══════════════════════════════════════╝
echo.

echo [1/3] Проверка зависимостей...
cd backend
if not exist "node_modules\" (
    echo 📦 Установка зависимостей...
    call npm install
    if errorlevel 1 (
        echo ❌ Ошибка установки зависимостей
        pause
        exit /b 1
    )
    echo ✅ Зависимости установлены
) else (
    echo ✅ Зависимости найдены
)

echo.
echo [2/3] Открытие браузера...
start http://localhost:3000

echo.
echo [3/3] Запуск сервера...
echo 🚀 Сервер запускается на http://localhost:3000
echo 💡 Нажмите Ctrl+C для остановки сервера
echo 💡 Для первой настройки БД: npm run init-db
echo.
node server.js

pause
