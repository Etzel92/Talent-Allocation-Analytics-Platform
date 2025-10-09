cd $PSScriptRoot\..\api
& .\.venv\Scripts\python -m ruff check . --fix
& .\.venv\Scripts\python -m black .
