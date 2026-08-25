# Arquitectura del Proyecto — Productivity Organizer Personal

## 1. Visión General
Aplicación web de página única (SPA) para un único usuario que funciona como organizador personal de productividad, inspirada en el estilo visual de *Persona 5 Royal* (evitando glassmorphism, usando estilo sólido/comics semi-detallados).

---

## 2. Stack Tecnológico
- **HTML5** — estructura semántica
- **CSS3** — variables, animaciones, diseño visual (sin framework CSS pesado para mantener control total del estilo)
- **JavaScript (Vanilla)** — lógica, gestión de estado con `localStorage`
- **`localStorage`** — persistencia de datos (single-user, no hay backend)
- **Assets locales**: `/assets/palette.png`, `/assets/font.png`

---

## 3. Arquitectura de Archivos

```
/MetaNav - Organizator/
│
├── assets/
│   ├── palette.png     # paleta de colores referencial
│   └── font.png        # referencia tipográfica (Optima Nova Black)
│
├── index.html          # entrada SPA, enlaza todos los scripts
├── style.css           # design system, variables, animaciones
├── app.js            # lógica principal, gestión de estado, renderizado
│
├── caso.txt            # requisitos del caso de estudio (original)
├── plan.txt            # plano original (referencia)
├── planificación.md    # contexto completo del taller
└── arquitectura.md     # <-- este archivo (planeación actual)
```

---

## 4. Rutas (Screens) y Componentes

| Ruta | Nombre Componente | Descripción |
|------|-------------------|-------------|
| `/` | `Dashboard` | Vista general: rachas, tareas hoy, productividad % |
| `/tasks` | `TaskBoard` | Cuadro Kanban: `Por hacer` / `En progreso` / `Hecho` |
| `/calendar` | `CalendarGrid` | Calendario mensual, resaltar días con tareas |
| `/focus` | `Timer` | Modo Pomodoro, contador visualizables |
| `/stats` | `ProgressChart` | Gráficos de productividad (líneas/áreas estilizados) |
| `/settings` | `Settings` | Preferencias: tema (drab/vibrant), métodos, notificaciones |

---

## 5. Flujo de Navegación

```
[Dashboard] ──► [TaskBoard] ──► [Calendar]
     │                │                │
     ▼                ▼                ▼
 [Focus] ◄─────── [Stats] ◄─────── [Settings]
```

- **Header** persistente en todas las rutas:
  - Avatar usuario
  - Notificación (badge = tareas pendientes)
  - Toggle de tema (drab ⇆ vibrant)
- **NavBar** con enlaces rápidos (fijo o slide-in)

---

## 6. Estado y Persistencia

```javascript
// Estado inicial almacenado en localStorage
const INITIAL_STATE = {
  tasks: [],                      // [{id, title, status, priority, dueDate}]
  focusSessions: 0,               // racha Pomodoro total
  completedToday: 0,
  selectedTheme: 'vibrant',       // 'drab' | 'vibrant'
  productivityMethods: ['pomodoro', 'kanban'],
  createdAt: Date.now()
};
```

**Data flow unidireccional:**
```
User Interaction → Action → State Update (reducer simple) → Re-render → localStorage
```

---

## 7. Design System Visual

### 7.1 Colores (palette referencia de P5R)

| Variable CSS | Valor | Descripción |
|--------------|-------|-------------|
| `--primary-red` | `#C30F1F` | Rojo Persona 5 — encabezados, acentos |
| `--background-dark` | `#1A1A1A` | Fondo general (modo vibrant) |
| `--background-drab` | `#333333` | Modo "real world" / inactivo |
| `--text-white` | `#FFFFFF` | Texto principal |
| `--accent-gold` | `#FFD700` | Accentos secundarios |
| `--border-comic` | `4px double #000` | Bordes gruesos tipo cómic |

### 7.2 Tipografía

- `--font-primary`: `"Optima Nova Black", sans-serif` (o fallback sistema)
- Encabezados con `border-style: double` o `groove` efecto cómic
- Títulos grandes con `background-clip: text` + gradiente red/black

### 7.3 Componentes de UI

- **Comic borders**: `border: 4px double #000` en `h1`, `h2`, tarjetas de sección
- **Shapes obliques**: `shape-outside: polygon()` para divs angulares
- **Transiciones**: `var(--transition-fast: 0.2s ease)`, `var(--transition-slow: 0.5s ease)`
- **Máscara/recuadro**: `mask-image` o `clip-path` para efectos P5R

---

## 8. Animaciones Clave

```css
/* Fade between screens */
.fade-enter { opacity: 0; }
.fade-enter-active { opacity: 1; transition: opacity 0.3s var(--transition-fast); }
.fade-exit { opacity: 1; transition: opacity 0.3s var(--transition-fast); }
.fade-exit-active { opacity: 0; }

/* Pop-up modal */
.pop-up-enter-from { transform: scale(0.8); opacity: 0; }
.pop-up-enter-to { transform: scale(1); opacity: 1; }

/* Pomodoro progress circle */
@keyframes progress { to { stroke-dashoffset: 0; } }
```

---

## 9. Componentes Principales (Jerarquía)

```
App
├── Header
│   ├── UserAvatar
│   ├── NotificationBell (badge: #pendientes)
│   └── ThemeToggle (drab / vibrant)
├── NavBar
│   ├── Item [Dashboard]   → /
│   ├── Item [Tasks]       → /tasks
│   ├── Item [Calendar]    → /calendar
│   ├── Item [Focus]       → /focus
│   └── Item [Stats]       → /stats
├── MainContent (dinámico según ruta)
│   ├── DashboardWidget    → tarjetas resumen + comic borders
│   ├── TaskList           → columnas Kanban + drag & drop
│   ├── CalendarGrid       → rejilla mes + tareas por día
│   ├── PomodoroTimer      → círculo progreso + números negrita
│   └── ProgressChart      → gráfico área/línea estilizado
└── Footer
    ├── Productivity Tip (cambia diario)
    └── Quote Reflexiva (máx 200 palabras: "Qué aprendí...")
```

---

## 10. Requerimientos del Caso (validación)

- [x] **Kit de Productividad Personal** — material visual funcional ✓
- [x] **Retos personales** en gestión del tiempo → Dashboard + TaskBoard
- [x] **Métodos/estrategias** (Pomodoro, Kanban) → selector en Settings + Timer
- [x] **Ejemplo real** en desarrollo de software → organizador de tareas programación
- [x] **Consejos propios** → Footer tip diario
- [x] **Reflexión escrita** (máx 200 palabras) → componente FooterQuote

---

## 11. Roadmap de Implementación (fases)

| Fase | Tareas Clave | Tiempo |
|------|--------------|--------|
| **1. Estructura base** | HTML skeleton, CSS variables, routing básico | 2 hrs |
| **2. Design System** | Palette, typography, comic borders | 3 hrs |
| **3. Componentes core** | Header, Nav, Dashboard widget | 4 hrs |
| **4. Persistencia** | localStorage, actions/state | 3 hrs |
| **5. Modos** | Theme toggle, drab/vibrant switching | 3 hrs |
| **6. Interacción** | Task drag-drop, calendar grid | 3 hrs |
| **7. Stats & Footer** | Progress chart, reflective quote | 2 hrs |
| **8. Pulido** | Animaciones, responsive, testing | 2 hrs |
| **TOTAL** | | **19 hrs** |

---

## 12. Nota de "Ponytail" (techo de diseño)

> `# ponytail: Global color lock usando palette red/black/white. Upgrade por usuario si se necesitan temas múltiples más adelante.`

---
*Documento generado para planificación antes de implementación. Basado en planificación.md + análisis visual Persona 5 Royal (Game UI Database).*