# Define la Base común para todos los modelos y exporta metadata para Alembic.
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Importa modelos para que Alembic detecte las tablas (no borrar).
# El import es intencional (side-effects): registra clases en Base.metadata.
from app.db import models  # noqa: E402,F401  # side-effect import for metadata

# Alembic usa esto como target_metadata en env.py
target_metadata = Base.metadata
