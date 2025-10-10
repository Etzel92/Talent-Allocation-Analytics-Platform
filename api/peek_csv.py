# /api/peek_csv.py
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd


# 1) Ubicar el archivo (acepta Employee.csv o employees.csv)
def find_csv() -> Path:
    data_dir = Path(__file__).resolve().parents[1] / "data"
    candidates = ["Employee.csv", "employees.csv"]
    for name in candidates:
        p = data_dir / name
        if p.exists():
            return p
    raise FileNotFoundError(f"No se encontró ninguno: {', '.join(candidates)} en {data_dir}")


# 2) Intentar diferentes separadores
def read_csv_safely(path: Path) -> tuple[pd.DataFrame, str]:
    trials = [",", ";", "\t"]
    last_err: Exception | None = None
    for sep in trials:
        try:
            df = pd.read_csv(path, sep=sep, encoding="utf-8-sig")
            # Heurística: si solo hay 1 columna y contiene separadores, intenta el siguiente
            if df.shape[1] == 1 and any(ch in str(df.columns[0]) for ch in [";", "\t", ","]):
                raise ValueError("Separador incorrecto (todo cayó en una sola columna).")
            return df, sep
        except Exception as e:
            last_err = e
    raise RuntimeError(f"No se pudo leer el CSV con separadores {trials}: {last_err}")


# 3) Normalizar nombres y construir mapeo
def normalize_columns(cols: list[str]) -> tuple[list[str], list[tuple[str, str]]]:
    norm = []
    mapping = []
    for c in cols:
        n = c.strip().lower().replace(" ", "_")
        mapping.append((c, n))
        norm.append(n)
    return norm, mapping


# 4) Columnas objetivo del MVP
MVP_COLS = [
    "name",
    "gender",
    "city",
    "age",
    "education",
    "years_experience",
    "department",
    "job_title",
    "salary",
    # Nota: "id" lo genera la BD, no es obligatorio en el CSV
]


def main():
    csv_path = find_csv()
    print(f"CSV: {csv_path}")

    df, used_sep = read_csv_safely(csv_path)
    print(f"Separador detectado: {repr(used_sep)}")
    print("Columnas originales:", list(df.columns))

    # Mapeo y normalización
    norm_cols, mapping = normalize_columns(list(df.columns))
    print("\nMapeo original → normalizado:")
    for orig, norm in mapping:
        print(f"  - {orig}  ->  {norm}")
    df.columns = norm_cols

    print("\nPrimeras 3 filas (ya normalizado):")
    with pd.option_context("display.max_columns", None, "display.width", 160):
        print(df.head(3))

    # Dtypes útiles para seed/modelos
    print("\nTipos inferidos (pandas):")
    print(df.dtypes)

    # Comparar contra MVP
    current = set(df.columns)
    must = set(MVP_COLS)
    extras = sorted(current - must)
    missing = sorted(must - current)

    print("\n=== Comparación con columnas MVP ===")
    print("Objetivo MVP:", MVP_COLS)
    print("Sobran (se pueden omitir en la BD/seed):", extras if extras else "ninguna")
    print(
        "Faltan en el CSV (revisa nombres o calcula/deriva):",
        missing if missing else "ninguna",
    )

    # Código de salida útil en CI: 0 OK, 2 si faltan columnas MVP
    if missing:
        print("\nADVERTENCIA: Faltan columnas necesarias para el MVP.")
        sys.exit(2)


if __name__ == "__main__":
    main()
