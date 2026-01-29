@echo off
echo ========================================
echo Limpando arquivos Next.js nao utilizados
echo ========================================
echo.

if exist "node_modules" rmdir /s /q node_modules
if exist ".next" rmdir /s /q .next
if exist "out" rmdir /s /q out
if exist "src" rmdir /s /q src
if exist "public" rmdir /s /q public
if exist "package.json" del /q package.json
if exist "package-lock.json" del /q package-lock.json
if exist "tsconfig.json" del /q tsconfig.json
if exist "next.config.js" del /q next.config.js
if exist "postcss.config.js" del /q postcss.config.js
if exist "tailwind.config.ts" del /q tailwind.config.ts
if exist ".env.local" del /q .env.local
if exist ".env.example" del /q .env.example
if exist "setup.bat" del /q setup.bat
if exist "Dockerfile" del /q Dockerfile
if exist "next-env.d.ts" del /q next-env.d.ts

echo.
echo Limpeza concluida!
echo.
echo Arquivos do projeto HTML:
echo  - index.html
echo  - styles.css
echo  - script.js
echo  - server.py
echo  - README.md
echo.
pause
