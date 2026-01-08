@echo off
echo MongoDB Atlas Connection Test
echo ==============================
echo.
echo This script will test your MongoDB Atlas connection.
echo Make sure you have:
echo 1. Whitelisted your IP address in MongoDB Atlas
echo 2. Correct username and password
echo 3. Network allows outbound connections
echo.
echo Press any key to start the test...
pause > nul

cd backend
node test-mongo.js

echo.
echo If the test failed, check the MONGODB_SETUP.md file for troubleshooting steps.
echo.
pause