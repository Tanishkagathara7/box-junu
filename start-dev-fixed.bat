@echo off
echo 🚀 Starting BoxCric Development Environment with Fixed Code
echo =========================================================
echo.
echo 🔧 Killing any existing node processes...
taskkill /F /IM node.exe >nul 2>&1
echo.
echo 📱 Starting development servers...
echo.
start "BoxCric Dev" cmd /k "npm run dev"
echo.
echo ✅ Servers starting...
echo 🔧 Backend: http://localhost:3001
echo 📱 Frontend: http://localhost:8080
echo.
echo 🎯 The fix has been applied:
echo    - Frontend now uses local development server
echo    - Backend has improved ground population logic
echo    - "Ground details unavailable" should be fixed!
echo.
echo 📝 Next steps:
echo    1. Wait for servers to start
echo    2. Open http://localhost:8080 in your browser
echo    3. Navigate to "My Bookings"
echo    4. You should see proper ground names!
echo.
pause
