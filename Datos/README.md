# Datos del Proyecto (No versionados)

Esta carpeta **no** se sube a GitHub (por tamano y gestion de datos).

Para ejecutar el proyecto, copia aqui los archivos fuente:

1. `Confirmados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-15.csv`
2. `Confirmados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-15.csv`
3. `Confirmados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-15.csv`
4. `Fallecidos por municipio, fecha de fallecimiento del 2020-02-13 al 2026-03-15.csv`
5. `Tamizados por municipio, fecha de emisión de resultado del 2020-02-13 al 2026-03-15.csv`
6. `Tamizados por municipio, fecha de inicio de síntomas del 2020-02-13 al 2026-03-15.csv`
7. `Tamizados por municipio, fecha de toma de muestra del 2020-02-13 al 2026-03-15.csv`
8. (Opcional) `Base_de_Datos_ESAVIS.xlsx`

## Estructura esperada

```
Proyecto-API-Python-DataScience/
├── Datos/
│   ├── Confirmados por municipio, fecha de emisión de resultado ... .csv
│   ├── ...
│   └── Base_de_Datos_ESAVIS.xlsx
```

## Nota

- El backend detecta la carpeta `Datos/` en raiz del proyecto.
- Si faltan archivos, algunos endpoints devolveran informacion incompleta o vacia.
