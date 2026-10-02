@echo off
chcp 65001 >nul
title May chu website - NGUYEN QUY SON
echo.
echo  ============================================
echo   MAY CHU WEBSITE - NGUYEN QUY SON
echo  ============================================
echo.
echo  Dang khoi dong may chu va mo website...
echo.
start "" http://localhost:8765/
python -m http.server 8765 --directory "%~dp0"
