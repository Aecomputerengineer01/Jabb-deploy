@echo off
chcp 65001 >nul
echo ==============================================================
echo 🚀 กำลังเปิดระบบ JAABBAR 3D LIVE OPS (Dashboard)...
echo ==============================================================
start http://localhost:8080/
python server.py
pause
