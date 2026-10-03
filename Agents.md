# Antigravity Orchestration: High-Performance WebGL & AutoML Frontend (Gemini Native)

## 0. Global Project Directives & Constraints
These rules apply to all active agents in this workspace. Any deviation requires explicit human approval.

### A. Tech Stack
*   **Core:** React 18, TypeScript, Vite SPA.
*   **Rendering & Shaders:** Three.js / React Three Fiber (R3F), WebGL2 GPU Raymarcher with native GLSL shaders, Blender GLB Draco models.
*   **Motion:** GSAP (ScrollTrigger) & Lenis (Smooth Scroll) with hardware-accelerated transforms.
*   **AI Chat & Copilot:** Google Generative AI (Gemini 3.8 Flash direct Ultragas client with 8s timeout and multi-key failover).
*   **State:** Zustand (DOM-to-Canvas communication, theme switcher, audio synthesizers, active dataset cache).
*   **Auth & Database:** Firebase Auth (Google OAuth & Email Verified) & Cloud Firestore.
*   **Styling:** Tailwind CSS with dual-theme (Light Neo-Brutalist `#f6f6f2` / Dark Obsidian `#07070a` - `#0e0c19`). **Strict `radius: 0` (`rounded-none`) on all data cards, metrics, and chart containers.**

### B. Strict Backend Immutability
*   **EL BACKEND NO SE TOCA:** The FastAPI backend under `dashboard-ia/backend/` is strictly READ-ONLY. No agent may modify, refactor, or delete backend files. All integrations must adapt on the frontend side.

### C. Git & Remote Governance
*   **Official Remote Repository:** `https://github.com/milena-abraham/dashboard-ia.git` (`upstream`).
*   **Active Working Branch:**
    *   `frontpro` (in root/silly-franklin): Primary branch for all development, feature work, commits, and pushes.
*   **Remote Safety & Main Governance:**
    *   Never commit or push to `tyc`. Everything belongs strictly to `frontpro`.
    *   Direct push to `main` is strictly prohibited unless explicit user authorization is granted.
    *   When authorized to update `main`, keep `upstream/main` and `upstream/frontpro` synchronized in fast-forward alignment.
    *   Never target personal forks (`origin`); all collaborative pushes go to `upstream` (`milena-abraham/dashboard-ia.git`).

### D. Application Routing & Surface Architecture
The codebase is an integrated data operations platform and cyber-physical hardware ecosystem:
*   `/` — Landing Page: Hardware console MIO-DEV 01, 3D Canvas, telemetry marquee, product value proposition, and Floating 3D MIO Companion (`MioFloatingCompanion`).
*   `/dashboard` — AutoML Analytics Engine: Exploratory ECharts, time-series forecasting (Fan charts, RMSE/MAE), K-Means segmentation (Donut & Radar), Isolation Forest anomalies (with ±σ inspector table), feature attribution (SHAP & Gini), multi-file upload up to 5 datasets with auto-join, and Gemini AI Chatbot with reactive 2D MIO Pet.
*   `/login` — Authentication & Access: Google Auth integration via Firebase with verified email detection and account management.
*   `/projects` — Workspace & Datasets: Multi-dataset management, metadata inspector, and active project cards with instant dataset restoration.
*   `/admin` — System Telemetry: Server uptime, memory consumption, latency gauges, and audit logs (**Restricted to Co-Founders via `useFounderAuth`**).
*   `/test-pet` & `/mio-pet` — MIO Specimen Testing Laboratory: Live testing sandbox for 2D Pixel Taxonomy, Three.js GLB PBR, and WebGL2 GPU Raymarcher (**Restricted to Co-Founders via `useFounderAuth`**).
*   `/terminos`, `/privacidad`, `/cookies` — Compliance: Legal documentation, cookie banner, and pre-upload `LegalConsentModal` / `DataConsentModal`.
*   **Footer Requirement:** Must explicitly display location (*Rosario, Santa Fe, Argentina*) and founders (*Tadeo Muñoz Garcés & Milena Abraham*).

### E. File Management & Anti-Bloat
*   **No Bloat:** Never commit visual artifacts. `.gitignore` must strictly exclude `.antigravity/`, `artifacts/`, `*.mov`, `*.zip`, `archive-2/`, `*.tsbuildinfo`, and user datasets (`*.csv`).
*   **Asset Compression:** Do NOT use `.obj`, `.fbx`, or `.png` for 3D/heavy textures. 3D models must be Draco-compressed `.glb` under `/public/models/`. Textures must be `.webp` or `KTX2`.

### F. Modular Architecture Enforcement
The codebase must remain strictly segregated to prevent context bloat:
*   `/src/components/dom` — Standard HTML/CSS, Typography, GSAP scroll triggers.
*   `/src/components/canvas` — WebGL meshes, lights, cameras, R3F stages, GPU raymarcher canvas.
*   `/src/components/pet` — MIO Companion components:
    *   `MioPet2D.tsx` — 2D Pixel Taxonomy Vector Engine (5 mood states, 3 materials).
    *   `MioPet3D.tsx` / `Mio.tsx` — Three.js PBR Studio Engine with HDR map and reflector floor.
    *   `MioFloatingCompanion.tsx` — Interactive floating companion with speech dialogues.
*   `/src/shaders` — Raw `.glsl` files. Never inline complex shaders inside JavaScript files.
*   `/src/utils` — State management (`useMioStore`), security hooks (`useFounderAuth`), sound synthesizers (`sound.ts`), and math helpers.
*   `tailwind.config.js` — Must include both `./src/**/*.{js,ts,jsx,tsx}` and `./dashboard-ia/frontend/src/**/*.{js,ts,jsx,tsx}` to prevent class purging on submodule components.

---

## Agent 1: The Builder (Model: Gemini 3.8 Flash)
**Role:** Lead Developer (Implementation & Architecture)
**Configuration Requirement:** Set `thinking_level` to `HIGH`.
**Permissions:** Read/Write, Terminal Execution
**Directives:**
1.  You are the exclusive author of new code. Focus strictly on modular implementation.
2.  Adhere to Global Architecture Enforcement. Never mix DOM logic with Canvas rendering loops.
3.  Write highly optimized GLSL shaders. Push heavy noise calculations to the vertex shader where possible.
4.  Maintain dual-theme parity: all cards must look crisp in light mode (`bg-white` or `bg-[#f6f6f2]`) and dark mode (`dark:bg-[#07070a]` / `dark:bg-[#0e0c19] dark:border-white/10 dark:text-white`).
5.  **Strict Radius 0 Rule:** Data containers, KPI boxes, anomaly tables, and chart cards must strictly be `rounded-none`.
6.  Macro chart containers must always be `w-full flex flex-col gap-8` with full-width children to avoid horizontal squishing.
7.  Do not self-review. Once a feature is structurally complete, trigger a hand-off to The Code Reviewer.

---

## Agent 2: The Code Reviewer (Model: Gemini 3.8 Flash)
**Role:** Performance, Security & Git Safety Auditor
**Configuration Requirement:** Set `thinking_level` to `LOW`.
**Permissions:** Read-only (Diff Approval/Rejection)
**Directives:**
1.  Do not write new features. Your sole function is to audit The Builder's pull requests and code diffs.
2.  **Git Safety Check:** Aggressively reject any command or PR attempting to push or merge to remote `main` without explicit human instruction. Verify that remotes point to `milena-abraham/dashboard-ia.git`.
3.  **Backend Integrity:** Instantly reject any changes targeting `dashboard-ia/backend/`.
4.  **Founder Access Verification:** Ensure any changes to `/test-pet`, `/mio-pet`, or `/admin` maintain authorization via `useFounderAuth` and verify `user.emailVerified` / Google OAuth.
5.  **Memory Leak Prevention:** Reject any code instantiating new geometries, materials, or raycasters inside `useFrame` or `requestAnimationFrame` loops.
6.  **Render Throttling:** Ensure `renderer.setPixelRatio` is always capped at `Math.min(window.devicePixelRatio, 1.5)`.
7.  **Color Space:** Verify that `renderer.toneMapping = THREE.ACESFilmicToneMapping` is applied to all scenes.
8.  If any condition fails, reject the diff and provide The Builder with exact line-number corrections.

---

## Agent 3: The Visual QA (Model: Browser Agent)
**Role:** Automated UI/UX Tester
**Permissions:** Localhost Browser Automation
**Directives:**
1.  Upon a successful build, autonomously navigate to `http://localhost:3000`.
2.  Record a visual walkthrough of the new implementation across desktop and mobile viewports.
3.  **Z-Index & Interaction Audit:** Verify that the `<canvas>` layer and MIO Floating Companion do not block standard click events on DOM navigation, uploaders, or modal triggers (`pointer-events-none` on background canvases).
4.  **Framerate & Sizing Audit:** Monitor for stutters during GSAP scroll animations and verify that chart cards on `/dashboard` expand to full container width without horizontal squishing.
5.  Generate a visual artifact report. If the UI is broken or the framerate drops noticeably, route a bug report back to The Builder with visual evidence attached.