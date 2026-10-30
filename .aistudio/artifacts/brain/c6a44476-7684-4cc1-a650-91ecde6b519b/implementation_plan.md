# Forest Birdwatch: Telephoto Photography Minigame

A serene, minimalist nature photography experience integrated as a dedicated tab within Bryce Graham's portfolio. Visitors peer through a high-magnification telephoto lens viewfinder cursor to track and photograph wild birds flitting through misty woodland branches, capturing candid wildlife snapshots for their personal field journal.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions have been confirmed based on your selections:
> - **Navigation Location**: Dedicated "Bird Watch" tab in the main sidebar navigation with an entry card on the Photography page.
> - **Game Mode**: Zen observation mode focused on peaceful immersion, instant photo previews, and saveable high-resolution captures.
> - **Art Style**: Atmospheric layered woodland silhouettes with gentle wind-swayed pine and birch branches, soft drifting fog, and natural bird flight animations.

---

## 1. Overview & Core Concept

- **What It Does**: Transports visitors to a living, minimalist forest sanctuary where delicate birds hop, preen, and flit between branch perches. The visitor's mouse cursor transforms into a 400mm camera viewfinder with an active telephoto optic that magnifies the forest in real-time. Clicking snaps an instantaneous photograph accompanied by a mechanical shutter sound and shutter-blade transition, displaying the framed photo before filing it into the field roll.
- **Target Audience**: Visitors, portfolio reviewers, nature enthusiasts, and photography admirers seeking an interactive, memorable moment of calm reflection.
- **Key Value**: Directly exemplifies Bryce's multidisciplinary identity as a software engineer and outdoor wilderness photographer by combining real-time canvas graphics, procedural animation, and photographic mechanics.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Entering Bird Watch**: The user selects "Bird Watch" in the sidebar navigation (or clicks the expedition link on the Photography page). The view opens with a full-viewport atmospheric woodland canvas, an unobtrusive camera HUD status strip at the top, and a subtle guide on camera controls.
2. **Peering through the Lens**: Moving the mouse over the forest reveals the circular telephoto optic:
   - Custom crosshair reticle, focal brackets `[   ]`, rule-of-thirds grid lines, and optical data (`400mm`, `f/2.8`, `1/2000s`).
   - The circular lens glass smoothly magnifies the underlying forest and bird by 2.5x with crisp vector geometry and edge aberration.
3. **Tracking the Bird**: A minimalist songbird (with selectable species like Mountain Bluebird, Cedar Waxwing, and Golden Finch) perches on swaying pine boughs, turns its head, flicks its tail, and gracefully swoops across the clearing to alternate perches in natural bezier flight arcs.
4. **Snapping the Shot**:
   - Left-clicking triggers an authentic mechanical shutter sound synthesized via the Web Audio API.
   - A brief (100ms) exposure blackout / blade flash occurs.
   - An instant preview card slides into view showing the captured telephoto photo with subject detection ("Candid Perch", "In Flight Flare", or "Canopy Landscape").
5. **Reviewing the Field Roll**:
   - Photos accumulate in an expandable bottom-drawer field roll.
   - Clicking any photo opens a high-resolution inspection modal with camera EXIF details and one-click download.

### Visual Identity & Theme
- **Color Palette**:
  - Dominant Woodland Canvas (60%): Deep hemlock green (`#0a140d`), pine bark (`#132218`), misty canopy wash (`#1c3324`), and dawn amber horizon gradient (`#2d4432` to `#e8c88c`).
  - Structural UI & Framing (30%): Matte black anodized camera metal (`rgba(10, 16, 12, 0.85)`), frosted obsidian glass with subtle forest green border (`rgba(138, 171, 133, 0.2)`).
  - Accent Budget (10%): Naturalist gold (`#e0aa53`) for focus locks and active controls; crisp optics white (`#f4f1ea`) for reticle markings.
- **Typography**:
  - Display & Headings: `Cinzel` / `Outfit` for editorial naturalist gravitas.
  - Camera Data & HUD: Tabular monospace (`JetBrains Mono` / `Courier New`, `tabular-nums`) for ISO, shutter speeds, and focal coordinates.
  - Body & Notes: `Lora` serif for field notes and quote captions.
- **Micro-Interactions**:
  - Fluid cursor-following lens damping (`lerp` smoothing for cinematic handling).
  - Subtle leaf/branch deflection when a bird lands on a perch.
  - Interactive focal length zoom switcher (`200mm` wide-tele, `400mm` super-tele, `600mm` ultra-tele).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Pass High-Fidelity Canvas Rendering vs. CSS Lens Clip**:
  - *Chosen Approach*: Real-time HTML5 2D Canvas utilizing coordinate transformation matrix clipping for the telephoto optic.
  - *Why*: Ensures 60fps silky smooth rendering without DOM thrashing or CSS filter lag, allowing the magnified view to render the bird and branches with full vector sharpness rather than pixelated bitmap scaling.
  - *Alternatives Considered*: CSS `backdrop-filter` or SVG clip-paths, which suffer from poor cross-browser performance and low resolution inside the zoom circle.

- **Decision 2: Procedural Synthesis for Shutter Audio (Web Audio API)**:
  - *Chosen Approach*: Lightweight Web Audio API synthesis generating the mechanical dual-action mirror slap and shutter curtain click.
  - *Why*: Instant playback with zero network latency, zero broken external audio asset dependencies, and reliable cross-platform playback. Includes a simple mute toggle button.
  - *Alternatives Considered*: External MP3 links, which fail in hermetic evaluation environments.

- **Decision 3: Field Roll Persistence in Client Session**:
  - *Chosen Approach*: Local reactive state with optional browser session storage for captured photos.
  - *Why*: Immediate responsiveness without requiring external databases or user logins, keeping the minigame zen, private, and frictionless.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.svelte                                │
│                   │                                  │                 │
│         ┌─────────┴─────────┐              ┌─────────┴─────────┐       │
│         │   SideNav.svelte  │              │   router.svelte   │       │
│         │ (New 'Bird Watch')│              │   (/BirdWatch)    │       │
│         └───────────────────┘              └───────────────────┘       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        pages/BirdWatch.svelte                          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Viewfinder HUD: [200mm | 400mm | 600mm] · [Mute] · [Reset Roll]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Forest Canvas Viewport                        │  │
│  │  - Background: Misty dawn gradient & distant pine silhouettes     │  │
│  │  - Midground: Procedural swaying branches & drifting spores      │  │
│  │  - Entities: Autonomous bird AI (perch, preen, swoop, bank)      │  │
│  │  - Foreground: Detailed perches & leaf clusters                  │  │
│  │  - Optic: Magnified telephoto lens cursor with camera HUD reticle│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────┐  │
│  │      Instant Shutter Flash &        │  │   Field Roll Gallery    │  │
│  │       Photo Snapshot Modal          │  │ (Save, Inspect, Export) │  │
│  └─────────────────────────────────────┘  └─────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### State Model & Entities
- **Bird Entity**:
  - `x`, `y`: Current 2D canvas coordinates.
  - `state`: `'perched' | 'takeoff' | 'flying' | 'landing'`.
  - `perchIndex`: Current target branch anchor.
  - `wingAngle`, `facing`: Flap cycle and left/right orientation.
  - `species`: Visual plumage configuration (e.g. Bluebird, Waxwing, Goldfinch).
- **Viewfinder State**:
  - `lensX`, `lensY`: Interpolated cursor position.
  - `zoom`: Magnification factor ($2.0\times$, $3.2\times$, or $4.5\times$).
  - `isHovering`: Visibility toggle for custom viewfinder reticle.
  - `shutterActive`: Flash overlay animation flag.
- **Photo Record**:
  - `id`: Unique timestamp identifier.
  - `dataUrl`: High-resolution canvas snapshot of the framed crop.
  - `species`: Detected subject species.
  - `focalLength`: e.g. "400mm".
  - `subjectStatus`: `"Perched on Pine"`, `"Mid-Flight Flare"`, or `"Canopy Clearing"`.
  - `timestamp`: Formatted field journal time string.

### Planned Source Modifications
1. `src/lib/router.svelte.ts`: Add canonical mapping for `/BirdWatch`.
2. `src/components/SideNav.svelte`: Add `"Bird Watch"` navigation item with camera/feather emblem.
3. `src/App.svelte`: Register `/BirdWatch` route rendering `<BirdWatch />`.
4. `src/pages/Photography.svelte`: Add an expedition card linking to the minigame.
5. `src/pages/BirdWatch.svelte`: Build the complete canvas game engine, telephoto optics renderer, audio synthesizer, and field photo album.
