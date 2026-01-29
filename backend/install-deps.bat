@echo off
echo ========================================
echo SortMailBox Backend - Instalar dependencias
echo ========================================
echo.

if not exist .venv\Scripts\activate.bat (
    echo ERRO: .venv nao encontrado. Crie com: python -m venv .venv
    pause
    exit /b 1
)

echo Ativando .venv...
call .venv\Scripts\activate

echo Instalando dependencias...
pip install -r requirements.txt

echo.
echo ========================================
echo Concluido!
echo ========================================
echo.
echo Para iniciar o servidor:
echo   1. .venv\Scripts\activate
echo   2. python main.py
echo.
pause
