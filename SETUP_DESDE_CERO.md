# Guia de Arranque Desde Cero

Esta guia permite que cualquier colaborador clone el repositorio y levante el proyecto completo.

## 1) Clonar repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Proyecto-API-Python-DataScience
```

## 2) Preparar fuentes de datos

Los archivos de `Datos/` no se suben a GitHub.

Copiar localmente en `Datos/`:

1. `Confirmados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-15.csv`
2. `Confirmados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-15.csv`
3. `Confirmados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-15.csv`
4. `Fallecidos por municipio, fecha de fallecimiento del 2020-02-13 al 2026-03-15.csv`
5. `Tamizados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-15.csv`
6. `Tamizados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-15.csv`
7. `Tamizados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-15.csv`
8. (Opcional) `Base_de_Datos_ESAVIS.xlsx`

Validar presencia de archivos:

```bash
python scripts/verificar_datos.py
```

## 3) Levantar backend (FastAPI) Nota ( Tener instalado python verificar version) python --version

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  (linuex)
source venv/Scripts/activate(windows)
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

ruta directa en Windows (.\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload)

### Nota sobre distrobox

Si aparece `uvicorn: command not found`, activar `venv` o ejecutar directo:

```bash
venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 4) Levantar frontend (Angular)

En otra terminal:

```bash
cd frontend
npm install
ng serve
```

## 5) Verificar proyecto

- API: `http://localhost:8000/docs`
- Frontend: `http://localhost:4200`

## 6) Flujo recomendado de trabajo en Git

```bash
git checkout -b feature/nombre-corto
# cambios...
git add .
git commit -m "feat: descripcion breve"
git push -u origin feature/nombre-corto
```
