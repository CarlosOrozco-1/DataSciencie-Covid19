# Proyecto COVID-19 Guatemala - Dashboard

## Descripción
Dashboard interactivo para visualizar datos de COVID-19 en Guatemala, mostrando información por departamento y municipio.

## Tecnologías
- **Backend**: Python 3.x + FastAPI
- **Frontend**: Angular 17+ + D3.js
- **Datos**: Archivos CSV del Ministerio de Salud de Guatemala

## Estructura del Proyecto
```
proyecto-covid-gt/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Inicialización del paquete
│   │   ├── main.py               # Aplicación FastAPI principal
│   │   ├── config.py             # Configuraciones de la app
│   │   ├── models.py             # Modelos Pydantic
│   │   ├── routers/              # Endpoints de la API
│   │   │   ├── departamentos.py  # Endpoints de departamentos
│   │   │   └── municipios.py     # Endpoints de municipios
│   │   │   └── resumen.py        # Endpoints de resumen y filtros
│   │   └── services/
│   │       └── data_service.py   # Lógica de negocio
│   ├── Datos/                    # (opcional) archivos CSV locales
│   └── requirements.txt
├── frontend/                     # Aplicación Angular
├── Datos/                        # Archivos CSV (no versionados)
├── scripts/
│   └── verificar_datos.py        # Verifica presencia de fuentes de datos
├── README.md
└── AGENTS.md
```

## API Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/departamentos` | Lista de todos los departamentos |
| GET | `/api/departamentos/{codigo}` | Datos de un departamento específico |
| GET | `/api/departamentos/{codigo}/municipios` | Municipios de un departamento |
| GET | `/api/municipios` | Lista de todos los municipios |
| GET | `/api/municipios/{codigo}` | Datos de un municipio específico |
| GET | `/api/resumen` | Resumen nacional de COVID-19 |
| GET | `/api/filtrar` | Datos filtrados por fecha |

## Datos Disponibles (CSV)
- **Confirmados** por municipio (fecha de emisión, inicio de síntomas, toma de muestra)
- **Fallecidos** por municipio
- **Tamizados** por municipio (múltiples fechas)

### Importante para colaboración en GitHub
- La carpeta `Datos/` **no se sube** al repositorio (está en `.gitignore`).
- Cada colaborador debe copiar localmente los archivos CSV a `Datos/`.
- Para validar que todo está completo, ejecutar:

```bash
python scripts/verificar_datos.py
```

## Ejecutar el Proyecto

### Backend (en distrobox)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Nota importante sobre distrobox y `uvicorn`
- En este proyecto, al trabajar en entorno aislado (distrobox), `uvicorn` puede no estar en el `PATH` global si no activas el entorno virtual.
- Si aparece `uvicorn: command not found`, activa el entorno con `source venv/bin/activate` o ejecuta el binario directo: `venv/bin/uvicorn`.
- En otro equipo con instalación global de paquetes Python, este problema puede no ocurrir, pero se recomienda usar `venv` para mantener dependencias aisladas y reproducibles.

### Frontend
```bash
cd frontend
npm install
ng serve
```

## Documentación de la API
Una vez ejecutando el backend, visita: `http://localhost:8000/docs`

## Fase Actual
- ✅ Fase 0: Configuración del entorno
- ✅ Fase 1: Backend (FastAPI) - COMPLETO
- ✅ Fase 2: Frontend (Angular + D3) - EN PROGRESO

## Licencia
MIT
