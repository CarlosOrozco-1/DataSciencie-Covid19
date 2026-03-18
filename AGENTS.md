# AGENTS.md - Proyecto COVID-19 Guatemala

## Descripción General
Dashboard interactivo para visualizar datos de COVID-19 en Guatemala por departamento y municipio.

## Tecnologías
- **Backend**: Python 3.x + FastAPI
- **Frontend**: Angular 17+
- **Visualización**: D3.js + GeoJSON
- **Datos**: CSV (Ministerio de Salud Guatemala)

## Estructura del Proyecto
```
proyecto-covid-gt/
├── backend/                  # API REST (FastAPI)
│   ├── app/
│   │   ├── __init__.py       # Inicialización del paquete
│   │   ├── main.py           # Aplicación FastAPI principal
│   │   ├── config.py         # Configuraciones
│   │   ├── models.py         # Modelos Pydantic
│   │   ├── routers/          # Endpoints
│   │   │   ├── __init__.py
│   │   │   ├── departamentos.py
│   │   │   ├── municipios.py
│   │   │   └── resumen.py
│   │   └── services/         # Lógica de negocio
│   │       ├── __init__.py
│   │       └── data_service.py
│   ├── Datos/                # Archivos CSV
│   └── requirements.txt
├── frontend/                 # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Componentes del dashboard
│   │   │   │   ├── mapa/     # Componente del mapa con D3.js
│   │   │   │   └── tooltip/  # Componente de tooltip
│   │   │   ├── services/    # Servicios HTTP
│   │   │   │   └── covid/   # Servicio de datos COVID
│   │   │   ├── models/      # Modelos TypeScript
│   │   │   │   └── covid.models.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.html
│   │   │   └── app.component.css
│   │   ├── assets/
│   │   │   └── geo/         # Archivos GeoJSON de Guatemala
│   │   │       └── guatemala.json
│   │   ├── styles.css       # Estilos globales
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── Datos/                    # Archivos CSV originales
└── README.md
```

## Datos CSV Disponibles
Archivos en `backend/Datos/`:
1. `Confirmados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-15.csv`
2. `Confirmados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-15.csv`
3. `Confirmados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-15.csv`
4. `Fallecidos por municipio, fecha de fallecimiento del 2020-02-13 al 2026-03-15.csv`
5. `Tamizados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-15.csv`
6. `Tamizados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-15.csv`
7. `Tamizados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-15.csv`

Estructura de columnas: `departamento`, `codigo_departamento`, `municipio`, `codigo_municipio`, `poblacion`, + fechas (YYYY-MM-DD)

## API Endpoints

### Backend (Python/FastAPI)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/departamentos` | Lista todos los departamentos |
| GET | `/api/departamentos/{codigo}` | Datos de un departamento específico |
| GET | `/api/departamentos/{codigo}/municipios` | Municipios de un departamento |
| GET | `/api/municipios` | Lista todos los municipios |
| GET | `/api/municipios/{codigo}` | Datos de un municipio específico |
| GET | `/api/resumen` | Totales (confirmados, fallecidoes, tamizados) |
| GET | `/api/filtrar` | Filtrado por departamento, municipio y/o fecha |

## Convenciones de Código

### Python
- Usar **Pydantic** para modelos de datos
- Usar **pandas** para procesamiento de CSV
- snake_case para variables, PascalCase para clases
- Comentar cada función y sección importante
- Español (comentarios), English (código)

### Angular / TypeScript
- Angular 17+ con standalone components
- camelCase para variables, kebab-case para archivos
- Servicios con HttpClient para llamadas HTTP
- Interfaces TypeScript para tipos de datos
- D3.js para visualizaciones (mapa coroplético)
- GeoJSON para datos geográficos de Guatemala

### Comentarios en Código
- Agregar comentarios descriptivos en cada bloque de código
- Documentar funciones con JSDoc/TSDoc
- Explicar la lógica de negocio en español

## Ejecución

### Backend (en distrobox)
```bash
cd /home/ceorozcom/Documents/Proyecto-API-Python-DataScience/backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Nota técnica (distrobox + entorno virtual)
- En distrobox, si no está activo el entorno virtual, puede aparecer: `uvicorn: command not found`.
- Solución recomendada: activar `venv` antes de iniciar la API (`source venv/bin/activate`).
- Alternativa: ejecutar el binario de forma explícita (`venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`).
- Aunque en otros equipos se puede usar instalación global, para este proyecto se mantiene `venv` como práctica recomendada para aislar dependencias.

### Frontend
```bash
cd frontend
npm install
npm install d3 @types/d3
ng serve
```

## Fases del Proyecto

### Fase 0: Configuración del Entorno ✅
- Creación de distrobox
- Estructura de carpetas

### Fase 1: Backend (FastAPI) ✅
- APIs para datos COVID-19
- Procesamiento de archivos CSV
- Endpoints de departamentos y municipios

### Fase 2: Frontend (Angular) - EN PROGRESO
- Dashboard con mapa de Guatemala
- Integración con D3.js
- Tooltip interactivo al posicionar cursor sobre departamentos
- Consumo de APIs del backend

## Notas Importantes
- El proyecto corre en distrobox (entorno aislado Ubuntu)
- Los datos CSV están sincronizados entre host y distrobox
- Puerto recomendado para API: 8000
- Puerto recomendado para Angular: 4200
- El mapa usa GeoJSON con los 22 departamentos de Guatemala
