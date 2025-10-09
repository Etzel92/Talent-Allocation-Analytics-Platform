cd $PSScriptRoot\..\api
if (!(Test-Path .\.venv)) { py -m venv .venv }
.\.venv\Scripts\pip install -U pip -r .\requirements.txt
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
