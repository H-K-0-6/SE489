@echo off

:: Step 1: Start the Frontend Client in the background
cd /d "C:\Users\uneve\Desktop\SE489\client"
start "" npm run dev

:: Step 2: Start the Backend Server in the background
cd /d "C:\Users\uneve\Desktop\SE489\server"
start "" node index.js

:: Step 3: Wait 3 seconds for both to spin up
timeout /t 3 /nobreak

:: Step 4: Open the website automatically
explorer "http://localhost:5173/"