@echo off
echo ========================================
echo AutoU Backend - Setup
echo ========================================
echo.

echo Criando ambiente virtual...
python -m venv venv

echo Ativando ambiente virtual...
call venv\Scripts\activate

echo Instalando dependencias...
pip install -r requirements.txt

echo.
echo ========================================
echo Setup concluido!
echo ========================================
echo.
echo Para iniciar o servidor, execute:
echo   1. venv\Scripts\activate
echo   2. python main.py
echo.
echo Nao esqueca de configurar sua HUGGINGFACE_API_KEY no arquivo .env
echo.
pause
