# Integración con Google Sheets

El formulario envía las respuestas a Google Sheets mediante una función serverless de Vercel (`/api/submit`). No se guardan secretos en el frontend.

## Estructura de la hoja

| A — timestamp | B — nombre | C — negocio | D — contacto | E — payload_json |
|---|---|---|---|---|
| 15/05/2026 10:30 | Ana García | Dulcería La Rosa | ana@ejemplo.com | `{"businessName":"...","answers":{...}}` |

La primera fila debe ser el encabezado. Puedes añadirlo manualmente o dejar que las primeras respuestas lo pueblen.

---

## 1. Crear el proyecto en Google Cloud

1. Ve a [console.cloud.google.com](https://console.cloud.google.com/).
2. Crea un nuevo proyecto o selecciona uno existente.
3. En el menú lateral → **APIs y servicios** → **Biblioteca**.
4. Busca **Google Sheets API** y haz clic en **Habilitar**.

---

## 2. Crear una Service Account

1. En **APIs y servicios** → **Credenciales** → **Crear credenciales** → **Cuenta de servicio**.
2. Dale un nombre (p. ej. `form-sheets-bot`) y haz clic en **Crear y continuar**.
3. En el rol puedes dejarlo sin rol o asignar **Básico → Editor** (opcional para este uso).
4. Haz clic en **Listo**.
5. En la lista de cuentas de servicio, haz clic en la que acabas de crear.
6. Ve a la pestaña **Claves** → **Agregar clave** → **Crear clave nueva** → formato **JSON** → **Crear**.
7. Se descarga un archivo `.json`. **Guárdalo en un lugar seguro y nunca lo subas al repositorio.**

Del archivo JSON necesitarás:
- `client_email` → valor para `GOOGLE_CLIENT_EMAIL`
- `private_key` → valor para `GOOGLE_PRIVATE_KEY`

---

## 3. Crear la hoja de cálculo y compartirla

1. Crea una nueva hoja en [sheets.google.com](https://sheets.google.com/).
2. En la primera fila añade los encabezados:
   ```
   timestamp | nombre | negocio | contacto | payload_json
   ```
3. Copia el ID de la hoja desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```
4. Haz clic en **Compartir** (arriba a la derecha).
5. Pega el `client_email` de tu Service Account y dale permiso de **Editor**.
6. Haz clic en **Enviar**.

---

## 4. Configurar variables de entorno en Vercel

1. En tu proyecto de Vercel → **Settings** → **Environment Variables**.
2. Añade las tres variables:

| Nombre | Valor |
|---|---|
| `GOOGLE_CLIENT_EMAIL` | `my-bot@my-project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Clave completa: `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `GOOGLE_SHEET_ID` | ID copiado del paso 3 |

> **Nota sobre la clave privada:** En el dashboard de Vercel, los saltos de línea se guardan como `\n` literales. La función los convierte automáticamente. Pega la clave exactamente como aparece en el JSON descargado (incluyendo las cabeceras `BEGIN/END`).

3. Haz un nuevo **deploy** (o redespliega) para que las variables surtan efecto.

---

## 5. Probar localmente

1. Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Rellena los valores en `.env.local`.
3. Instala el CLI de Vercel si aún no lo tienes:
   ```bash
   npm i -g vercel
   ```
4. Inicia el servidor de desarrollo con soporte para funciones serverless:
   ```bash
   vercel dev
   ```
5. En otra terminal, envía una petición de prueba:
   ```bash
   curl -X POST http://localhost:3000/api/submit \
     -H "Content-Type: application/json" \
     -d '{"contactName":"Test","businessName":"Mi Negocio","email":"test@test.com","submittedAt":"2026-01-01T00:00:00Z","answers":{}}'
   ```
6. Verifica que aparece una fila nueva en tu hoja de Google Sheets.

---

## Solución de problemas

| Error | Causa probable | Solución |
|---|---|---|
| `Server misconfiguration` | Faltan variables de entorno | Verifica los 3 env vars en Vercel |
| `403 Forbidden` de Sheets API | La hoja no está compartida con el service account | Repite el paso 3.5 |
| `invalid_grant` | La clave privada tiene formato incorrecto | Revisa que `\n` se conviertan a saltos reales |
| `404` en `/api/submit` | La función no se desplegó | Verifica que `api/submit.ts` esté en el repo y redespliega |
