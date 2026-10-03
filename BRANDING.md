# BRANDING DE MIO: GUÍA MAESTRA DE IDENTIDAD, DISEÑO, HARDWARE & ESPECÍMENES (MIO PET)

> **DOCUMENTO OFICIAL PARA AGENTES Y DESARROLLADORES — VERSIÓN VIGENTE 2026**  
> Este documento define el sistema de identidad único y oficial de **MIO**. Establece la filosofía visual, la paleta cromática, la tipografía cinética y técnica, la taxonomía exacta de **MIO Espécimen 01 (MIO Pet 2D & 3D)**, la consola de hardware **MIO-DEV 01**, la arquitectura visual del **AutoML Engine & Dashboard**, y las directivas anti-slop.
> 
> ⚠️ **ALERTA CRÍTICA PARA AGENTES:** Queda estrictamente prohibido utilizar la estética antigua (bordes redondeados `rounded-xl`/`rounded-2xl` en datos, sombras borrosas, degradados púrpura difusos tipo IA genérica, antenas con bolitas redondas o iconos/emojis). Toda nueva pantalla o componente debe alinearse rigurosamente con esta guía.

---

## 1. ESENCIA & MANIFIESTO DE MARCA

* **Nombre Oficial:** **MIO** (o Mio)
* **Tagline Primario:** *Intelligent Data Operations & AutoML*
* **Categoría:** *Neo-Brutal Analytics, AutoML Console & Cyber-Physical Companion*
* **Misión:** Transformar planillas de cálculo sin preparar (`.csv`, `.xlsx`) en decisiones ejecutivas de alto impacto, proyecciones temporales y detección de anomalías en menos de 60 segundos, sin requerir código ni infraestructura.
* **Manifiesto:**
  > *"Dejá de adivinar. Empezá a predecir."*  
  > *"Convertí planillas de datos en decisiones inteligentes."*  
  > *"Poder corporativo. Diseño tangible."*  
  > *"Small screen. Big decisions."*
* **Tono de Voz:** Seguro, analítico, técnico de alta ingeniería pero accesible, directo y rioplatense contemporáneo (*"Subí tus planillas"*, *"Chateá con tus tablas"*, *"Inspeccioná anomalías"*).
* **Fundadores:** **Tadeo Muñoz Garcés** y **Milena Abraham** (Científicos de Datos y Desarrolladores).
* **Origen Institucional:** **Rosario, Santa Fe, Argentina** (*"Diseñado y desarrollado con 💚 en Rosario, Argentina"*).

---

## 2. FILOSOFÍA VISUAL: NEO-BRUTALISMO TANGIBLE & METROLOGÍA SUIZA

La identidad de MIO no es software etéreo ni plantillas estándar de SaaS; está inspirada en instrumental de precisión industrial suizo (Braun / Dieter Rams) y consolas táctiles contemporáneas (Teenage Engineering, Analogue Pocket):

1. **Arquitectura Monolítica & Radius Cero (`rounded-none`):**
   * **REGLA FUNDAMENTAL:** Todo contenedor de datos, tabla analítica, gráfico ECharts, tarjeta de KPI, modal de inspección y bloque de resultados lleva **estrictamente `rounded-none` (`radius: 0`)**.
   * Las tarjetas de KPIs y paneles de métricas se construyen como **bloques monolíticos divididos por líneas de precisión** (`gap-px` sobre fondo `bg-zinc-200 dark:bg-white/[0.08]`), eliminando las tarjetas flotantes separadas con curvas.
   * Las curvas (`rounded-full`, `rounded-md`) están reservadas **exclusivamente** para botones físicos interactivos (tipo píldora o botón de hardware), switches y badges pequeños de estado.

2. **Cero Sombras Borrosas (Anti-Blur):**
   * Prohibido el uso de sombras difusas tipo `shadow-xl` o `shadow-2xl`.
   * Se utilizan bordes nítidos de 1px a 2px (`border border-zinc-200 dark:border-white/10` o `border-2 border-black`), y sombras mecánicas duras sin desenfoque (`box-shadow: 2px 2px 0px #000` o `box-shadow: 4px 4px 0px #000`).

3. **Micro-interacciones Mecánicas Hápticas:**
   * **Hover:** Desplazamiento sutil mecánico hacia arriba-izquierda (`translate(-1px, -1px)` con incremento de borde o sombra dura).
   * **Active (Click):** Presión táctil con hundimiento hacia abajo-derecha (`translate(1px, 1px)` con amortiguación).

---

## 3. PALETA CROMÁTICA OFICIAL (SISTEMA DUAL MKT & APP)

### A. Colores Primarios de Identidad (Brand Core)

| Token | Hex | Aplicación & Contexto |
| :--- | :--- | :--- |
| **`mio-lime`** | `#BDF559` | **Color insignia de MIO**. Llamados a la acción (CTA primarios), barras de histograma ocular del Pet, líneas de tendencia en Fan Charts, métricas nominales en alza, pulsos LED y articulaciones. |
| **`mio-lime-hover`** | `#C8FF6A` | Estado hover de botones y elementos interactivos lima. |
| **`antenna-lime`** | `#C8F065` | Lima pastel suave específico para la antena del Pet (emissive `#A6E535`). |
| **`mio-violet` (UI)** | `#7647EB` | **Color corporativo primario**. Botones secundarios, clústeres K-Means, acentos de navegación, badges de edición. |
| **`mio-violet-wcag`** | `#602CD1` | Variante de violeta de alto contraste accesible para fondos claros (ratio $\ge$ 4.5:1). |
| **`pbr-violet-frame`**| `#6838E2` | Acabado metálico violeta eléctrico del chasis 3D PBR (`roughness: 0.24`, `metalness: 0.38`). |
| **`pbr-violet-body`** | `#361A88` | Tono profundo azul-violeta real del cuerpo interno 3D PBR (`roughness: 0.28`, `metalness: 0.45`). |
| **`pbr-violet-feet`** | `#321882` | Tono profundo índigo de los pies del Pet 3D PBR. |

### B. Fondos y Superficies de la Suite

| Token | Hex | Aplicación & Comportamiento |
| :--- | :--- | :--- |
| **`mio-bg` (Light)** | `#F6F6F2` | **Fondo global de la plataforma** en modo claro (papel táctil / hormigón cálido desaturado). Es el mismo tono del piso de estudio 3D. |
| **`mio-surface`** | `#FFFFFF` | Fondo de contenedores y paneles en modo claro (`border border-zinc-200`). |
| **`mio-obsidian` (Dark)**| `#07070A` | **Fondo global de la plataforma** en dark mode y fondo de pantalla OLED. |
| **`mio-dark-card`** | `#0E0C19` / `#141124` | Superficie de paneles analíticos y tarjetas en dark mode (`border dark:border-white/10`). |
| **`mio-border-dark`** | `#1E1B2E` / `rgba(255,255,255,0.08)` | Divisores de precisión y grillas monolíticas `gap-px`. |

### C. Colores Semánticos & Telemetría Analítica

| Token | Hex | Estado / Función |
| :--- | :--- | :--- |
| **Nominal / Safe** | `#10B981` | 100% Calidad de datos, convergencia de modelos, LED de enlace de servidor, estado nominal. |
| **Anomaly / Outlier** | `#EF4444` / `#F43F5E` | Outliers severos en Isolation Forest, desvíos $\pm 3\sigma$, estado `anomalia` del Pet. |
| **Anomaly White** | `#F6F6F2` / `#FFFFFF` | Pico emisivo blanco brillante de anomalía extrema en el ojo derecho del Pet. |
| **Caution / Standby** | `#F59E0B` / `#FBBF24` | Outliers moderados, imputación de nulos, estado `celebrando` del Pet. |
| **Telemetry Stream** | `#0EA5E9` / `#60A5FA` | Logs de red, barrido matricial en tiempo real, estado `trabajando` del Pet. |
| **Sleep Dim** | `#5B7A2E` / `#556B2F` | Emisivo atenuado modo ahorro de energía, estado `durmiendo` del Pet. |

---

## 4. SISTEMA TIPOGRÁFICO & JERARQUÍA

El stack tipográfico de MIO fusiona diseño experimental de alta gama con legibilidad técnica:

```
┌────────────────────────────────────────────────────────────────────────┐
│  HERO H1 MONUMENTAL       →  Climate Crisis (Variable Axis YEAR 1979)  │
│  TÍTULOS & NARRATIVA      →  Space Grotesk (Tracking -0.02em / -0.04em)│
│  MÉTRICAS & TELEMETRÍA    →  JetBrains Mono (Weights 400, 600, 700)    │
└────────────────────────────────────────────────────────────────────────┘
```

### A. Tipografía Display Monumental: **Climate Crisis** (`font-climate`)
* **Uso Exclusivo:** Título H1 principal de la Landing Page (*"Convertí planillas en decisiones"*).
* **Comportamiento Cinético:** Fuente variable con eje paramétrico `'YEAR'` calibrado de **1979 a 2050**.
* **Micro-interacción:** Estado base en `YEAR 1979`. Al hacer hover sobre el H1, transiciona fluidamente hacia `YEAR 2035` con curva bezier cúbica `cubic-bezier(0.23, 1, 0.32, 1)`.

### B. Tipografía Editorial & Encabezados: **Space Grotesk** (`font-display` / `font-sans`)
* **Pesos:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold).
* **Características:** Caracteres geométricos puros, tracking cerrado (`tracking-tight`), remates limpios sin serifas.
* **Uso:** Encabezados de sección (H2, H3), subtítulos, nombres de paneles, modales y botones de acción.

### C. Tipografía de Metrología & Telemetría: **JetBrains Mono** (`font-mono`)
* **Pesos:** 400 (Regular), 600 (SemiBold), 700 (Bold).
* **Uso Estricto y Obligatorio:** Cifras numéricas, métricas de KPI ($R^2$, RMSE, tiempo de inferencia), coordenadas de gráficos, encabezados de columnas de datos, nombres de archivo (`.csv`, `.xlsx`), matrices oculares (`[2,3,2]`), etiquetas z-score ($\pm\sigma$) y timestamps.

---

## 5. MIO ESPÉCIMEN 01: EL PROTAGONISTA BIOLÓGICO-DIGITAL (MIO PET)

> **ACLARACIÓN VITAL:** MIO no es un chatbot genérico ni una ilustración decorativa. MIO es un **Espécimen Cyber-Physical**, un monitor biológico-digital de telemetría de datos con geometría y proporciones exactas 1:1.

### A. Taxonomía Geométrica 2D (`MioPet2D.tsx`)
Renderizado vectorial en SVG basado en grilla métrica unitaria ($1u = 10px$, viewport $21u \times 22u$):
1. **Chasis Chamferado:** Polígono rectangular de $15u \times 11u$ con esquinas biseladas simétricamente a $1u$ en 45°.
2. **Pantalla OLED Obsidiana:** Polígono biselado de $11u \times 8u$ centrado en el chasis con esquinas biseladas a $0.8u$ (`#0E0C19` en modo oscuro / `#07060B`).
3. **Ojos Histograma Contiguos:** Cada ojo está formado por **3 barras verticales adyacentes de $1u$ de ancho**. Separación entre ojo izquierdo y derecho: exactamente $3u$. La altura de cada barra varía dinámicamente según el estado de ánimo (de $1u$ a $4u$).
4. **Boca / Indicador de Nivel:** Barra horizontal de $3u \times 1u$ centrada bajo los ojos.
5. **Articulaciones y Brazos:** Pestañas de acoplamiento laterales en Lima Neón `#BDF559`.
6. **Pies:** Dos apoyos redondeados de amortiguación en la base.
7. **Antena Superior de Telemetría:**
   * **REGLA ESTRICTA:** Vástago rectangular vertical con **cabezal cúbico** en lima pastel (`#C8F065`).
   * **PROHIBICIÓN ABSOLUTA:** Queda estrictamente prohibido dibujar antenas con bolitas redondas o círculos decorativos. Es una antena geométrica ortogonal.

### B. Los 5 Estados de Ánimo Canónicos (Moods)

Cada estado refleja una fase del ciclo de vida del análisis de datos:

| ID Estado | Nombre | Matriz Ocular | $\sigma$ / Telemetría | Color Dominante | Comportamiento & Micro-animación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`reposo`** | 01 REPOSO | `[2,3,2] [2,3,2]` | $\sigma = 0.47$ | `#BDF559` (Lima) | Respiración suave y tranquila, parpadeo sutil, pupilas histograma equilibradas. Esperando datasets. |
| **`trabajando`** | 02 TRABAJANDO | `[1,2,3] [3,2,1]` | $\sigma = 0.82$ | `#60A5FA` (Celeste) | Ondulación senoidal rítmica de las barras oculares emulando cómputo matricial y fit de gradiente. |
| **`celebrando`** | 03 CELEBRANDO | `[2,3,4] [2,3,4]` | $\sigma = 0.82$ | `#FBBF24` (Ámbar) | Salto de júbilo en eje Y, brazos anclados a la base con oscilación hacia afuera, confeti de píxeles para métricas $R^2 \ge 0.95$. |
| **`anomalia`** | 04 ANOMALÍA | `[2,2,2] [2,2,4]` | $\sigma = 0.75$ | `#F43F5E` / `#FFFFFF` | Glitch cromático, antena temblorosa en lavanda `#E4B8FF`, barra derecha extendida al máximo en blanco brillante ($\pm 3\sigma$). |
| **`durmiendo`** | 05 DURMIENDO | `[1,1,1] [1,1,1]` | $\sigma = 0.00$ | `#A78BFA` / `#5B7A2E` | Scanlines tenues, ojos comprimidos a una única línea horizontal ($1u$), ahorro de recursos y espera pasiva. |

### C. Los 3 Acabados de Materiales Oficiales

1. **Violeta Eléctrico Anodizado (`violeta` / `violet`):**
   * Chasis y marco en violeta eléctrico (`#6838E2` / `#7647EB`, `roughness: 0.24`, `metalness: 0.38`).
   * Cuerpo interno en violeta profundo real (`#361A88`).
   * Pies en índigo oscuro (`#321882` / `#4623A8`).
2. **Titanio Satén (`titanio` / `titanium`):**
   * Chasis en aleación aeroespacial satinada (`#8E8A9A` / `#8E8E9C`, `metalness: 1.0`, `roughness: 0.32`).
   * Cuerpo y pies en grafito mate (`#4A4756` / `#3F3C49`).
3. **Cromo Negro / Obsidiana (`cromo_negro` / `blackChrome`):**
   * Chasis monolítico negro espejo (`#2A2733` / `#1E1C27`, `metalness: 1.0`, `roughness: 0.16`).
   * Reflejos especulares obsidianos de alto contraste (`#15131C` / `#17151D`).

### D. Renderizado 3D Studio PBR (`Mio.tsx`, `petKit.ts`, `MioHeroStage.tsx`)

* **Modelos Oficiales:** Archivos Draco GLB optimizados bajo `/public/models/` (`mio_reposo.glb`, `mio_trabajando.glb`, `mio_celebrando.glb`, `mio_anomalia.glb`, `mio_durmiendo.glb`).
* **Cámara de Estudio:** Equivalente a lente de 85mm para retrato (FOV $17^\circ$, distancia $7.2$ a $8.9$, elevación $13^\circ$ a $14^\circ$, azimut $22^\circ$ a $32^\circ$).
* **Sistema de Iluminación Softbox:** Softbox cenital de estudio fotográfico suave, tira especular izquierda de realce de perfil, luz de contorno (rim light) y luz tenue de rebote inferior.
* **Piso Reflector Infinito:** Reflector plano seamless con color base `#F6F6F2` (modo claro) y atenuación radial suave concentrada bajo el personaje (`smoothstep(2.4, 0.05, dist) * 0.20`), acompañada por sombra direccional suave (`#100C1E`, opacidad $0.20$).
* **Bloom Selectivo Calibrado:** `UnrealBloomPass` con umbral estricto ($0.98$). El fondo `#F6F6F2` y el chasis metálico **nunca emiten bloom**; únicamente los glifos oculares y emisivos lima superan el umbral con un resplandor táctil contenido.

### E. Integración del Pet en el Ecosistema

1. **Copiloto Flotante (`MioFloatingCompanion.tsx`):** Acompañante 3D interactivo en la landing page con burbuja de diálogo reactiva y selector de estados.
2. **Stage 3D del Hero (`MioHeroStage.tsx`):** Stage interactivo que sincroniza los estados del Pet con el scroll y las interacciones del cursor.
3. **Copiloto en Chat IA (`DataChatbot.tsx`):** MIO Pet 2D integrado en la barra de consulta, reaccionando visualmente a las respuestas y el análisis de Gemini.
4. **Reemplazo de Spinners (`LoadingAnalysis.tsx`):** Durante el procesamiento de planillas en `/dashboard`, MIO en estado `trabajando` sustituye a cualquier spinner circular genérico.
5. **Laboratorio de Especímenes (`/test-pet` y `/mio-pet`):** Sandbox exclusivo para fundadores para testing y calibración de motores 2D y 3D.

---

## 6. SISTEMA DEL DASHBOARD ANALÍTICO & MODELOS AUTOML (`/dashboard`)

La interfaz analítica traslada la precisión del hardware al software operativo:

1. **Paneles Monolíticos de KPIs:**
   * Contenedores con `rounded-none`, bordes rectos y grilla `gap-px`.
   * Cifras de gran escala en `JetBrains Mono` con etiquetas en mayúsculas técnicas.

2. **ECharts Palette & Contrast:**
   * **Fan Charts (Series Temporales):** Línea de tendencia nítida en `#BDF559`, conos de incertidumbre (80% y 95%) en opacidades calibradas `rgba(189, 245, 89, 0.20)` y `rgba(189, 245, 89, 0.08)`.
   * **Radar & K-Means Clusters:** Rellenos en violeta corporativo `#7647EB` con vértices y acentos en lima `#BDF559`.
   * **Dispersión de Anomalías (Isolation Forest):** Puntos nominales en grafito/lima sutil; outliers resaltados en carmesí `#EF4444` con badges $\pm\sigma$.
   * **Importancia de Variables (SHAP / Gini):** Barras horizontales limpias con tipografía monoespaciada.

3. **Arquitectura Anti-Squish (Regla de Oro de Layout):**
   * Todas las macrosecciones de gráficos (`ExploratoryCharts`, `ForecastSection`, `SegmentationSection`, `AnomaliesSection`, `FeatureImportanceSection`) deben renderizarse a **ancho total (`w-full`)** en un flujo vertical `w-full flex flex-col gap-8`.
   * **PROHIBIDO:** Envolver bloques de gráficos en grillas sin span que los colapsen horizontalmente.

4. **Multi-Dataset Auto-Join:**
   * Soporte para subir hasta 5 datasets simultáneos.
   * Auto-detección del dataset principal (fact-table) ordenando automáticamente por tamaño en bytes descendente (`file.size DESC`).
   * Panel visual de fusión con detección inteligente de llaves foráneas (`id`, `sku`, `codigo`, `customer_id`).

---

## 7. EL DISPOSITIVO FÍSICO: "THE MIO DEVICE" (MIO-DEV 01)

El **MIO Device** es la consola de hardware industrial complementaria de la marca (presente en el Hero de la Landing):

* **Chasis:** Policarbonato violeta satinado con parting line de inyección de plástico negra.
* **Perilla Jog Dial:** Cilindro de aluminio estriado CNC para rotar métricas con sonido analógico de trinquete.
* **Pantalla OLED:** Pantalla obsidiana curva con scanlines sutiles.
* **Controles Físicos:** Cruceta D-PAD basculante en 3D, Botón A (Lima `#BDF559`, avanzar), Botón B (Violeta profundo, retroceder), SELECT (horizonte temporal) y START (ejecutar AutoML).
* **Identidad Sonora (Web Audio API):** Clics mecánicos y pulsos analógicos sintetizados en tiempo real mediante Web Audio nativo (`playMioDevSound`), sin archivos MP3 externos.

> **NOTA CLAVE:** El MIO Device es la **estación física de control**, mientras que **MIO Espécimen 01 es el copiloto inteligente vivo**. No deben confundirse ni intercambiarse de forma errónea.

---

## 8. CUMPLIMIENTO LEGAL & SEGURIDAD DE FUNDADORES

1. **Rosario, Santa Fe, Argentina en el Footer:**
   * Todo footer institucional debe indicar explícitamente: *"Rosario, Santa Fe, Argentina"* y los nombres de los fundadores (*Tadeo Muñoz Garcés & Milena Abraham*).
2. **Consentimiento Pre-Upload (Data Privacy):**
   * Antes de enviar archivos al backend, la aplicación debe presentar `DataConsentModal` / `LegalConsentModal` informando que el cómputo se realiza en memoria sin almacenar datos privados permanentemente.
3. **Páginas Legales Dedicadas:**
   * `/terminos`, `/privacidad`, `/cookies`.
4. **Acceso Exclusivo de Fundadores (`useFounderAuth`):**
   * Las rutas `/admin`, `/test-pet` y `/mio-pet` están protegidas y restringidas criptográficamente a:
     - `tadeomunozgarces@gmail.com`
     - `milenapabraham@gmail.com`
   * Requieren validación con Google OAuth y `emailVerified: true`.

---

## 9. DIRECTIVAS ANTI-SLOP (LO QUE NUNCA DEBE IMPLEMENTARSE)

Cualquier implementación que contenga los siguientes elementos será **inmediatamente rechazada**:

* ❌ **BANNED: Bordes Redondeados en Datos:** Usar `rounded-xl`, `rounded-2xl` o `rounded-3xl` en contenedores de métricas, tablas o gráficos. Todo dato es estrictamente `rounded-none`.
* ❌ **BANNED: Sombras Borrosas:** Usar `shadow-xl`, `shadow-2xl` o halos desenfocados genéricos.
* ❌ **BANNED: Emojis en Interfaces Técnicas:** Usar emojis (`🚀`, `🤖`, `💡`, `⚡`, `🔮`, `✨`) en botones, tablas o KPIs. Utilizar únicamente iconos sobrios de Lucide.
* ❌ **BANNED: Degradados Púrpura Fluorescentes Genéricos:** Fondos difusos estilo "AI startup" de plantilla. La paleta es táctil, sobria y de alto contraste.
* ❌ **BANNED: Antena con Bolita Redonda en el Pet:** Dibujar la antena de MIO con una esfera o punto circular. La antena es un prisma rectangular con cubo en el extremo.
* ❌ **BANNED: Spinners Circulares Genéricos:** En flujos de análisis de datos, el loader oficial es **MIO Pet 2D en estado `trabajando`**.
* ❌ **BANNED: Lenguaje Inflado:** Frases como *"Magia Neuronal"* o *"Inteligencia Milagrosa"*. El lenguaje es formal y de ciencia de datos: *"Validación Cruzada"*, *"Pipeline Neuronal Autónomo"*, *"Aislamiento de Anomalías Multivariado"*.

---

## 10. LOGOTIPO & MARCAS GRÁFICAS

* **Isotipo / Monograma:** Letra **`M`** mayúscula geométrica, de trazo pesado e inclinación dinámica hacia adelante (cursiva arquitectónica), cortada limpiamente en su vértice central.
* **Logo en Barra de Navegación:** Cuadrado negro con borde de 2px, letra `M` en lima neón (`bg-black text-[#bdf559] border-2 border-black font-mono font-black`), seguido de la palabra **`MIO`** y un punto LED verde lima pulsante.
* **Favicon & PWA:** Isotipo con contraste absoluto optimizado para visualización en pestañas oscuras y claras.

---

*Fin del documento maestro de Branding de MIO (Edición 2026). Consérvese como referencia permanente de diseño, hardware y especímenes para todos los agentes y desarrolladores del proyecto.*
