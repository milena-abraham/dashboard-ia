# 🚀 Guía de Despliegue en Hugging Face Spaces (16 GB de RAM Gratis)

Esta guía te muestra cómo desplegar tu Backend en **Hugging Face Spaces** para contar con **16 GB de RAM y 2 vCPU dedicadas 100% gratis**, eliminando para siempre los límites de memoria de 15 MB y los reinicios por OOM.

---

## 📌 Paso 1: Crear el Space en Hugging Face (1 minuto)

1. Ingresá a **[huggingface.co](https://huggingface.co)** e iniciá sesión con tu cuenta (o creá una gratis en 30 segundos; **no pide tarjeta de crédito**).
2. Hacé clic arriba a la derecha en tu foto de perfil ➔ **"New Space"** (o entrá directamente a [huggingface.co/new-space](https://huggingface.co/new-space)).
3. Completá estos campos:
   - **Space name:** `dashboard-ia-api` (o el nombre que prefieras).
   - **License:** `mit` (o la que gustes).
   - **Select the Space SDK:** Elegí **Docker** 🐳.
   - **Choose a Docker template:** Elegí **Blank**.
   - **Space hardware:** Dejá seleccionado el gratuito: **CPU basic • 2 vCPU • 16 GB RAM • Free**.
   - **Space visibility:** 
     - **Public (Recomendado para API):** Permite que tu frontend en Vercel se comunique libremente sin tokens de autenticación. *(Tus claves secretas como Gemini van ocultas en Secrets, nadie las puede ver).*
4. Hacé clic en **"Create Space"**.

---

## 📌 Paso 2: Cargar las Claves Secretas (Variables de Entorno)

En la página de tu Space recién creado:
1. Hacé clic en la pestaña **"Settings"** (arriba a la derecha).
2. Bajá hasta la sección **"Variables and secrets"**.
3. Hacé clic en **"New secret"**:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** *(Tu clave de Gemini API)*
4. Hacé clic en **"Save"**.

---

## 📌 Paso 3: Subir el Código al Space

Tenés 2 formas facilísimas de subir el backend a tu Space:

### Opción A — Con el script automático (1 solo comando)
Desde la terminal en tu computadora:
```bash
./scripts/deploy_to_hf.sh
```
El script te pedirá tu usuario de Hugging Face y subirá el backend automáticamente.

---

### Opción B — Con Git manual
Hugging Face te da un comando git clon en la pestaña de tu Space. Solo tenés que agregar el remoto y pushear:
```bash
# Agregá el repositorio de tu Space como remoto:
git remote add hf https://huggingface.co/spaces/TU_USUARIO/dashboard-ia-api

# Pusheá la rama a Hugging Face:
git push hf feat/huggingface-spaces:main --force
```
*(Reemplazá `TU_USUARIO` con tu nombre de usuario en Hugging Face).*

---

## 📌 Paso 4: Obtener la URL y Conectar con Vercel

1. Una vez que termine de compilar (demora aprox. 2 minutos), en la parte superior derecha de tu Space hacé clic en los **tres puntitos (...)** ➔ **"Embed this Space"** o mirá la URL directa.
2. La URL directa de tu API será:
   ```text
   https://TU_USUARIO-dashboard-ia-api.hf.space
   ```
3. Entrá a tu panel de **Vercel** ➔ tu proyecto frontend ➔ **Settings** ➔ **Environment Variables**.
4. Editá la variable `NEXT_PUBLIC_API_URL` con tu nueva URL de Hugging Face:
   ```text
   NEXT_PUBLIC_API_URL=https://TU_USUARIO-dashboard-ia-api.hf.space
   ```
5. Hacé un **Redeploy** en Vercel.

🎉 **¡Listo!** Ahora tu Dashboard IA corre sobre **16 GB de RAM**. Podés subir datasets de 100 MB o 200 MB con cientos de miles de filas sin que el servidor sufra ni se reinicie.
