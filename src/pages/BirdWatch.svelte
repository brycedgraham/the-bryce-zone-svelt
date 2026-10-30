<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  // Audio Context for mechanical camera shutter
  let audioCtx: AudioContext | null = null;
  let isMuted = $state(false);

  // Viewport and Canvas references
  let canvas: HTMLCanvasElement | null = $state(null);
  let ctx: CanvasRenderingContext2D | null = null;
  let container: HTMLDivElement | null = $state(null);

  // Background Image element (clean sky, no static bird)
  let bgImage: HTMLImageElement | null = null;
  let isBgLoaded = $state(false);

  // Settings & Controls
  type FocalLength = "200mm" | "400mm" | "600mm";
  let focalLength = $state<FocalLength>("400mm");
  const zoomMultipliers: Record<FocalLength, number> = {
    "200mm": 1.9,
    "400mm": 2.8,
    "600mm": 4.2,
  };

  type Atmosphere = "natural" | "golden" | "twilight";
  let atmosphere = $state<Atmosphere>("natural");

  // Mouse / Lens position
  let mouse = { x: -1000, y: -1000 };
  let lensPos = { x: -1000, y: -1000 };
  let isHoveringCanvas = $state(false);

  // Target tracking state
  let lockedBird = $state<string | null>(null);
  let isDoubleLocked = $state(false);

  // Flash animation
  let shutterFlash = $state(false);
  let flashTimer: number | null = null;

  // Recent Snap Preview
  interface CapturedPhoto {
    id: string;
    dataUrl: string;
    subject: string;
    status: string;
    focalLength: string;
    iso: string;
    shutter: string;
    time: string;
    quality: string;
    isDouble: boolean;
  }

  let recentSnap = $state<CapturedPhoto | null>(null);
  let snapToastTimer: number | null = null;
  let fieldRoll = $state<CapturedPhoto[]>([]);
  let inspectedPhoto = $state<CapturedPhoto | null>(null);

  // Species catalogue tailored to the storybook woodland aesthetic
  interface BirdSpecies {
    id: string;
    name: string;
    primaryColor: string;
    bellyColor: string;
    accentColor: string;
    beakColor: string;
    sizeScale: number;
    description: string;
    wingSpan: number;
  }

  const speciesList: BirdSpecies[] = [
    {
      id: "bluebird",
      name: "Mountain Bluebird",
      primaryColor: "#4a8ac2",
      bellyColor: "#b8d8ec",
      accentColor: "#285b8c",
      beakColor: "#27384a",
      sizeScale: 1.0,
      description: "Gentle azure songbird frequenting open woodland clearings and boughs.",
      wingSpan: 18,
    },
    {
      id: "waxwing",
      name: "Cedar Waxwing",
      primaryColor: "#c07b46",
      bellyColor: "#f7e899",
      accentColor: "#cf3d3d",
      beakColor: "#262322",
      sizeScale: 1.08,
      description: "Cinnamon crested beauty with silky plumage and crimson wax wing accents.",
      wingSpan: 19,
    },
    {
      id: "goldfinch",
      name: "Pine Goldfinch",
      primaryColor: "#e6b73c",
      bellyColor: "#fbf5d5",
      accentColor: "#426749",
      beakColor: "#d97706",
      sizeScale: 0.88,
      description: "Cheerful bright gold forager hopping among sunny foliage clusters.",
      wingSpan: 15,
    },
    {
      id: "tanager",
      name: "Scarlet Tanager",
      primaryColor: "#e04747",
      bellyColor: "#fca5a5",
      accentColor: "#27272a",
      beakColor: "#fde047",
      sizeScale: 1.02,
      description: "Striking vermilion visitor contrasting vividly against the green canopy.",
      wingSpan: 18,
    },
    {
      id: "sparrow",
      name: "Song Sparrow",
      primaryColor: "#8d5b3d",
      bellyColor: "#ede1d1",
      accentColor: "#452817",
      beakColor: "#594433",
      sizeScale: 0.95,
      description: "Tawny woodland singer known for perching on low boughs and singing.",
      wingSpan: 16,
    },
    {
      id: "hummingbird",
      name: "Forest Hummingbird",
      primaryColor: "#3c9668",
      bellyColor: "#bbf7d0",
      accentColor: "#15803d",
      beakColor: "#1e293b",
      sizeScale: 0.72,
      description: "Tiny iridescent sprite hovering with rapid wingbeats near meadow blooms.",
      wingSpan: 12,
    },
  ];

  // Active birds in the clearing
  interface ActiveBird {
    id: string;
    species: BirdSpecies;
    x: number;
    y: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    controlX: number;
    controlY: number;
    flightProgress: number;
    flightDuration: number;
    flightTime: number;
    state: "entering" | "perched" | "flying" | "landing" | "exiting";
    perchIndex: number;
    facing: number;
    wingFlap: number;
    tailAngle: number;
    headLookTimer: number;
    headTilt: number;
    perchWaitTimer: number;
    breathe: number;
    hopsRemaining: number;
  }

  let activeBirds = $state<ActiveBird[]>([]);
  let lastSpeciesIndex = 0;
  let spawnCooldownTimer = 1.0;
  let companionCheckTimer = 16.0;

  // Solid Physical Perch Objects (Branches, Rustic Fence Post, Mossy Rock, Leafy Boughs)
  type PerchType = "branch" | "post" | "rock" | "twig";
  interface SolidPerch {
    id: number;
    name: string;
    type: PerchType;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    perchX: number;
    perchY: number;
    thickness: number;
    leafAngle: number;
    isOccupied: boolean;
    bounce: number;
    bounceVel: number;
  }

  let solidPerches: SolidPerch[] = [];

  // Drifting blossom petals / leaves
  interface LeafParticle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    alpha: number;
    rotation: number;
    rotSpeed: number;
    color: string;
  }
  let leaves: LeafParticle[] = [];

  let animationFrameId: number;
  let lastTime = 0;

  // Initialize solid physical perch objects aligned with the illustration's framing
  function initForest(width: number, height: number) {
    solidPerches = [
      // 0. Left High Bough (Main bough extending inward from left tree)
      {
        id: 0,
        name: "Left High Bough",
        type: "branch",
        startX: width * 0.08,
        startY: height * 0.35,
        endX: width * 0.33,
        endY: height * 0.32,
        perchX: width * 0.25,
        perchY: height * 0.33,
        thickness: 9,
        leafAngle: -0.15,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 1. Left Upper Twig
      {
        id: 1,
        name: "Left Upper Twig",
        type: "twig",
        startX: width * 0.05,
        startY: height * 0.23,
        endX: width * 0.23,
        endY: height * 0.20,
        perchX: width * 0.17,
        perchY: height * 0.21,
        thickness: 6,
        leafAngle: -0.18,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 2. Left Mid-Canopy Branch
      {
        id: 2,
        name: "Left Mid Bough",
        type: "branch",
        startX: width * 0.07,
        startY: height * 0.47,
        endX: width * 0.27,
        endY: height * 0.44,
        perchX: width * 0.20,
        perchY: height * 0.45,
        thickness: 8,
        leafAngle: -0.12,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 3. Right High Bough (Main bough extending inward from right tree)
      {
        id: 3,
        name: "Right High Bough",
        type: "branch",
        startX: width * 0.92,
        startY: height * 0.35,
        endX: width * 0.67,
        endY: height * 0.32,
        perchX: width * 0.74,
        perchY: height * 0.33,
        thickness: 9,
        leafAngle: 0.15,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 4. Right Upper Twig
      {
        id: 4,
        name: "Right Upper Twig",
        type: "twig",
        startX: width * 0.95,
        startY: height * 0.23,
        endX: width * 0.77,
        endY: height * 0.20,
        perchX: width * 0.83,
        perchY: height * 0.21,
        thickness: 6,
        leafAngle: 0.18,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 5. Right Mid-Canopy Branch
      {
        id: 5,
        name: "Right Mid Bough",
        type: "branch",
        startX: width * 0.93,
        startY: height * 0.47,
        endX: width * 0.73,
        endY: height * 0.44,
        perchX: width * 0.80,
        perchY: height * 0.45,
        thickness: 8,
        leafAngle: 0.12,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 6. Midground Spruce Bough
      {
        id: 6,
        name: "Midground Pine Bough",
        type: "twig",
        startX: width * 0.45,
        startY: height * 0.55,
        endX: width * 0.62,
        endY: height * 0.52,
        perchX: width * 0.54,
        perchY: height * 0.53,
        thickness: 6,
        leafAngle: -0.05,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 7. Rustic Wooden Fence Post on meadow path edge
      {
        id: 7,
        name: "Meadow Trail Post",
        type: "post",
        startX: width * 0.41,
        startY: height * 0.76,
        endX: width * 0.41,
        endY: height * 0.66,
        perchX: width * 0.41,
        perchY: height * 0.66,
        thickness: 16,
        leafAngle: 0,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 8. Mossy Woodland Rock
      {
        id: 8,
        name: "Mossy Meadow Rock",
        type: "rock",
        startX: width * 0.67,
        startY: height * 0.76,
        endX: width * 0.67,
        endY: height * 0.72,
        perchX: width * 0.67,
        perchY: height * 0.72,
        thickness: 44,
        leafAngle: 0,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
      // 9. Left Meadow Grass Tuft & Sturdy Twig
      {
        id: 9,
        name: "Left Meadow Twig",
        type: "twig",
        startX: width * 0.22,
        startY: height * 0.76,
        endX: width * 0.34,
        endY: height * 0.72,
        perchX: width * 0.28,
        perchY: height * 0.73,
        thickness: 6,
        leafAngle: -0.1,
        isOccupied: false,
        bounce: 0,
        bounceVel: 0,
      },
    ];

    // Seed gentle drifting leaves and petals
    leaves = [];
    const colors = ["#8db88b", "#a4cbb4", "#e8c872", "#e5989b", "#739b72"];
    for (let i = 0; i < 26; i++) {
      leaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 2.2 + Math.random() * 3.5,
        speedX: -0.15 - Math.random() * 0.3,
        speedY: 0.12 + Math.random() * 0.28,
        alpha: 0.25 + Math.random() * 0.45,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    if (activeBirds.length === 0) {
      spawnBird(speciesList[0], 0);
    }
  }

  // Spawn a bird into the canopy
  function spawnBird(specificSpecies?: BirdSpecies, targetBranchIdx?: number) {
    if (solidPerches.length === 0 || !canvas) return;

    let sp: BirdSpecies;
    if (specificSpecies) {
      sp = specificSpecies;
    } else {
      lastSpeciesIndex = (lastSpeciesIndex + 1) % speciesList.length;
      sp = speciesList[lastSpeciesIndex];
    }

    let perchIdx = targetBranchIdx;
    if (perchIdx === undefined || solidPerches[perchIdx].isOccupied) {
      const free = solidPerches.filter((b) => !b.isOccupied);
      if (free.length > 0) {
        perchIdx = free[Math.floor(Math.random() * free.length)].id;
      } else {
        perchIdx = Math.floor(Math.random() * solidPerches.length);
      }
    }

    solidPerches[perchIdx].isOccupied = true;
    const target = solidPerches[perchIdx];

    // Align feet flush on top of the perch surface
    const feetOffset = 7 * sp.sizeScale;
    const startX = Math.random() > 0.5 ? -30 : canvas.width + 30;
    const startY = Math.random() * (canvas.height * 0.22) - 20;

    const newBird: ActiveBird = {
      id: "bird-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      species: sp,
      x: startX,
      y: startY,
      startX: startX,
      startY: startY,
      targetX: target.perchX,
      targetY: target.perchY - feetOffset,
      controlX: (startX + target.perchX) / 2,
      controlY: Math.min(startY, target.perchY) - 50,
      flightProgress: 0,
      flightDuration: 1.8 + Math.random() * 0.6,
      flightTime: 0,
      state: "entering",
      perchIndex: perchIdx,
      facing: target.perchX >= startX ? 1 : -1,
      wingFlap: 0,
      tailAngle: 0,
      headLookTimer: 1.2,
      headTilt: 0,
      perchWaitTimer: 3.5 + Math.random() * 3.5,
      breathe: 0,
      hopsRemaining: 3 + Math.floor(Math.random() * 3),
    };

    activeBirds = [...activeBirds, newBird];
  }

  // Camera shutter sound
  function playShutterSound() {
    if (isMuted) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(70, now + 0.04);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.06);

      const bufferSize = Math.floor(audioCtx.sampleRate * 0.035);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 2400;

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      whiteNoise.start(now);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(460, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.14);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.4, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.16);
    } catch {
      // Audio not supported
    }
  }

  // Trigger flight to next solid perch
  function triggerFlight(b: ActiveBird) {
    if (solidPerches.length < 2 || !canvas) return;

    b.hopsRemaining -= 1;

    // Check if it's time to fly away completely
    if (b.hopsRemaining <= 0) {
      solidPerches[b.perchIndex].isOccupied = false;
      b.state = "exiting";
      b.startX = b.x;
      b.startY = b.y;
      b.targetX = b.facing > 0 ? canvas.width + 120 : -120;
      b.targetY = -80;
      b.controlX = (b.startX + b.targetX) / 2;
      b.controlY = b.startY - 140;
      b.flightProgress = 0;
      b.flightTime = 0;
      b.flightDuration = 2.4;
      return;
    }

    // Pick another free solid perch
    solidPerches[b.perchIndex].isOccupied = false;
    let available = solidPerches.filter((br) => br.id !== b.perchIndex && !br.isOccupied);
    if (available.length === 0) {
      available = solidPerches.filter((br) => br.id !== b.perchIndex);
    }
    const nextPerch = available[Math.floor(Math.random() * available.length)];
    nextPerch.isOccupied = true;

    const feetOffset = 7 * b.species.sizeScale;

    b.state = "flying";
    b.perchIndex = nextPerch.id;
    b.startX = b.x;
    b.startY = b.y;
    b.targetX = nextPerch.perchX;
    b.targetY = nextPerch.perchY - feetOffset;
    b.flightProgress = 0;
    b.flightTime = 0;

    const midX = (b.startX + b.targetX) / 2;
    const peakY = Math.min(b.startY, b.targetY) - 70 - Math.random() * 70;
    b.controlX = midX + (Math.random() - 0.5) * 50;
    b.controlY = peakY;

    const dist = Math.hypot(b.targetX - b.startX, b.targetY - b.startY);
    b.flightDuration = Math.max(1.3, Math.min(2.6, dist / 280));
    b.facing = b.targetX >= b.startX ? 1 : -1;
  }

  // Simulation loop update
  function update(dt: number) {
    const lerpSpeed = 0.22;
    lensPos.x += (mouse.x - lensPos.x) * lerpSpeed;
    lensPos.y += (mouse.y - lensPos.y) * lerpSpeed;

    const lensRadius = getLensRadius();
    let lockedCount = 0;
    let primaryLockedSpecies: string | null = null;

    for (const b of activeBirds) {
      const dist = Math.hypot(lensPos.x - b.x, lensPos.y - b.y);
      if (dist < lensRadius * 0.78) {
        lockedCount++;
        if (!primaryLockedSpecies) {
          primaryLockedSpecies = b.species.name;
        }
      }
    }

    isDoubleLocked = isHoveringCanvas && lockedCount >= 2;
    lockedBird = isHoveringCanvas ? primaryLockedSpecies : null;

    // Drifting leaves
    if (canvas) {
      for (const l of leaves) {
        l.x += l.speedX;
        l.y += l.speedY;
        l.rotation += l.rotSpeed;
        if (l.y > canvas.height) {
          l.y = -10;
          l.x = Math.random() * canvas.width;
        }
        if (l.x < -10) {
          l.x = canvas.width + 10;
        }
      }
    }

    // Perch elastic deflection spring physics
    for (const p of solidPerches) {
      if (Math.abs(p.bounce) > 0.05 || Math.abs(p.bounceVel) > 0.05) {
        const springK = 80;
        const damping = 12;
        const force = -springK * p.bounce - damping * p.bounceVel;
        p.bounceVel += force * dt;
        p.bounce += p.bounceVel * dt;
      } else {
        p.bounce = 0;
        p.bounceVel = 0;
      }
    }

    // Bird state machine updates
    const remainingBirds: ActiveBird[] = [];

    for (const b of activeBirds) {
      if (b.state === "perched") {
        b.breathe += dt * 2.5;
        b.perchWaitTimer -= dt;
        b.headLookTimer -= dt;

        if (b.headLookTimer <= 0) {
          b.headTilt = (Math.random() - 0.5) * 0.45;
          if (Math.random() > 0.6) {
            b.facing = -b.facing;
          }
          b.headLookTimer = 1.6 + Math.random() * 2.6;
        }

        b.tailAngle = Math.sin(b.breathe * 2) * 0.08;

        // Keep feet anchored flush with any branch bounce
        const p = solidPerches[b.perchIndex];
        const feetOffset = 7 * b.species.sizeScale;
        if (p) {
          b.y = p.perchY - feetOffset + p.bounce;
        }

        if (b.perchWaitTimer <= 0) {
          triggerFlight(b);
          b.perchWaitTimer = 3.5 + Math.random() * 4.5;
        }
        remainingBirds.push(b);
      } else if (b.state === "entering" || b.state === "flying" || b.state === "exiting") {
        b.flightTime += dt;
        b.flightProgress = Math.min(1, b.flightTime / b.flightDuration);

        const t = b.flightProgress;
        const oneMinusT = 1 - t;
        b.x =
          oneMinusT * oneMinusT * b.startX +
          2 * oneMinusT * t * b.controlX +
          t * t * b.targetX;
        b.y =
          oneMinusT * oneMinusT * b.startY +
          2 * oneMinusT * t * b.controlY +
          t * t * b.targetY;

        b.wingFlap += dt * 28;

        if (b.state === "exiting") {
          if (t >= 0.98) {
            continue;
          }
          remainingBirds.push(b);
        } else {
          if (t >= 0.95) {
            b.state = "landing";
            // Touchdown impact deflects branch downward
            const p = solidPerches[b.perchIndex];
            if (p) {
              p.bounceVel = 28;
            }
          }
          remainingBirds.push(b);
        }
      } else if (b.state === "landing") {
        const p = solidPerches[b.perchIndex];
        const feetOffset = 7 * b.species.sizeScale;
        b.x = b.targetX;
        b.y = p ? p.perchY - feetOffset + p.bounce : b.targetY;
        b.state = "perched";
        b.wingFlap = 0;
        b.perchWaitTimer = 3.2 + Math.random() * 4.0;
        remainingBirds.push(b);
      }
    }

    activeBirds = remainingBirds;

    if (activeBirds.length === 0) {
      spawnCooldownTimer -= dt;
      if (spawnCooldownTimer <= 0) {
        spawnBird();
        spawnCooldownTimer = 1.5;
      }
    } else {
      spawnCooldownTimer = 1.5;

      companionCheckTimer -= dt;
      if (companionCheckTimer <= 0) {
        companionCheckTimer = 22.0 + Math.random() * 15.0;
        if (activeBirds.length === 1 && Math.random() < 0.45) {
          const currentSpId = activeBirds[0].species.id;
          const otherSpecies = speciesList.filter((s) => s.id !== currentSpId);
          const companion = otherSpecies[Math.floor(Math.random() * otherSpecies.length)];
          spawnBird(companion);
        }
      }
    }
  }

  function getLensRadius(): number {
    return focalLength === "200mm" ? 115 : focalLength === "400mm" ? 140 : 165;
  }

  // Draw background: user's clean forest clearing illustration (without static bird)
  function drawForestBackground(c: CanvasRenderingContext2D, width: number, height: number) {
    if (bgImage && isBgLoaded) {
      c.drawImage(bgImage, 0, 0, width, height);
    } else {
      // Clean fallback if loading
      const skyGrad = c.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#d5e8ef");
      skyGrad.addColorStop(0.5, "#e5f0f4");
      skyGrad.addColorStop(0.8, "#8bb28a");
      skyGrad.addColorStop(1, "#5b845a");
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, width, height);
    }

    if (atmosphere === "golden") {
      c.save();
      c.fillStyle = "rgba(235, 175, 75, 0.16)";
      c.fillRect(0, 0, width, height);
      c.restore();
    } else if (atmosphere === "twilight") {
      c.save();
      c.fillStyle = "rgba(25, 45, 80, 0.22)";
      c.fillRect(0, 0, width, height);
      c.restore();
    }

    // Drifting leaves/petals in the gentle breeze
    c.save();
    for (const l of leaves) {
      c.save();
      c.translate(l.x, l.y);
      c.rotate(l.rotation);
      c.fillStyle = l.color;
      c.globalAlpha = l.alpha;
      c.beginPath();
      c.ellipse(0, 0, l.size, l.size * 0.45, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    c.restore();
  }

  // Draw solid physical perches (branches, wooden trail post, mossy rock, twigs)
  function drawSolidPerches(c: CanvasRenderingContext2D, time: number) {
    const barkColor = "#a97561";
    const barkShade = "#96624e";
    const outlineColor = "#2b382d";
    const leafColor1 = "#739b72";
    const leafColor2 = "#8db88b";

    for (const p of solidPerches) {
      const bounceOffset = p.bounce;
      const naturalSway = Math.sin(time * 1.1 + p.id * 1.5) * (p.type === "twig" ? 1.5 : 0.8);
      const totalYOffset = bounceOffset + naturalSway;

      c.save();

      if (p.type === "branch" || p.type === "twig") {
        // Organic wooden branch
        c.lineWidth = p.thickness;
        c.strokeStyle = barkColor;
        c.lineCap = "round";

        // Main branch wood fill
        c.beginPath();
        c.moveTo(p.startX, p.startY);
        c.quadraticCurveTo(
          (p.startX + p.endX) / 2,
          (p.startY + p.endY) / 2 + totalYOffset,
          p.endX,
          p.endY + totalYOffset
        );
        c.stroke();

        // Dark outline contour matching the illustration
        c.lineWidth = p.thickness + 2.5;
        c.strokeStyle = outlineColor;
        c.globalCompositeOperation = "destination-over";
        c.beginPath();
        c.moveTo(p.startX, p.startY);
        c.quadraticCurveTo(
          (p.startX + p.endX) / 2,
          (p.startY + p.endY) / 2 + totalYOffset,
          p.endX,
          p.endY + totalYOffset
        );
        c.stroke();
        c.globalCompositeOperation = "source-over";

        // Woodgrain bark highlight
        c.lineWidth = p.thickness * 0.35;
        c.strokeStyle = barkShade;
        c.beginPath();
        c.moveTo(p.startX, p.startY + p.thickness * 0.2);
        c.quadraticCurveTo(
          (p.startX + p.endX) / 2,
          (p.startY + p.endY) / 2 + totalYOffset + p.thickness * 0.2,
          p.endX,
          p.endY + totalYOffset + p.thickness * 0.2
        );
        c.stroke();

        // Little green leaves sprouting from the branch
        drawBranchLeaves(c, p.perchX + 16, p.perchY + totalYOffset - 4, p.leafAngle, leafColor1, outlineColor);
        drawBranchLeaves(c, p.perchX - 22, p.perchY + totalYOffset - 2, p.leafAngle + 0.3, leafColor2, outlineColor);

      } else if (p.type === "post") {
        // Rustic wooden fence post on the meadow path edge
        const postW = p.thickness;
        const postTop = p.perchY + bounceOffset;
        const postBottom = p.startY;

        // Post body
        c.fillStyle = barkColor;
        c.strokeStyle = outlineColor;
        c.lineWidth = 2.0;

        c.beginPath();
        c.roundRect(p.perchX - postW / 2, postTop, postW, postBottom - postTop, [3, 3, 0, 0]);
        c.fill();
        c.stroke();

        // Flat beveled top cap where the bird perches
        c.fillStyle = "#baa18c";
        c.beginPath();
        c.ellipse(p.perchX, postTop, postW / 2, 3.5, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Wood grain lines & small knot on post
        c.strokeStyle = barkShade;
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(p.perchX - 3, postTop + 6);
        c.lineTo(p.perchX - 3, postBottom - 10);
        c.moveTo(p.perchX + 4, postTop + 9);
        c.lineTo(p.perchX + 4, postBottom - 8);
        c.stroke();

        // Knot
        c.fillStyle = barkShade;
        c.beginPath();
        c.arc(p.perchX + 1, postTop + 24, 2.2, 0, Math.PI * 2);
        c.fill();

        // Grass tuft around base
        c.fillStyle = leafColor1;
        c.strokeStyle = outlineColor;
        c.lineWidth = 1.5;
        drawGrassClump(c, p.perchX, postBottom);

      } else if (p.type === "rock") {
        // Mossy woodland boulder in the meadow
        const rockW = p.thickness;
        const rockTop = p.perchY + bounceOffset;

        c.fillStyle = "#6b876f";
        c.strokeStyle = outlineColor;
        c.lineWidth = 2.0;

        c.beginPath();
        c.moveTo(p.perchX - rockW / 2, rockTop + 14);
        c.quadraticCurveTo(p.perchX - rockW * 0.35, rockTop, p.perchX, rockTop);
        c.quadraticCurveTo(p.perchX + rockW * 0.35, rockTop, p.perchX + rockW / 2, rockTop + 14);
        c.quadraticCurveTo(p.perchX + rockW * 0.45, rockTop + 28, p.perchX, rockTop + 30);
        c.quadraticCurveTo(p.perchX - rockW * 0.45, rockTop + 28, p.perchX - rockW / 2, rockTop + 14);
        c.closePath();
        c.fill();
        c.stroke();

        // Moss lichen highlight on top flat
        c.fillStyle = "#8db88b";
        c.beginPath();
        c.ellipse(p.perchX - 4, rockTop + 3, 14, 4.5, 0.1, 0, Math.PI * 2);
        c.fill();

        // Tiny daisy flower beside rock
        c.fillStyle = "#fef08a";
        c.beginPath();
        c.arc(p.perchX + 22, rockTop + 12, 3, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }

      c.restore();
    }
  }

  // Draw leafy sprig helper
  function drawBranchLeaves(c: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, outline: string) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.fillStyle = color;
    c.strokeStyle = outline;
    c.lineWidth = 1.4;

    c.beginPath();
    c.ellipse(0, 0, 7.5, 3.8, -0.2, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    c.beginPath();
    c.ellipse(7, -4, 6.5, 3.2, 0.4, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    c.restore();
  }

  // Draw grass clump helper
  function drawGrassClump(c: CanvasRenderingContext2D, x: number, y: number) {
    c.save();
    c.translate(x, y);
    for (let i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(i * 4, 0);
      c.quadraticCurveTo(i * 7, -14, i * 9, -20);
      c.lineTo(i * 3, 0);
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  // Draw bird in storybook line-art aesthetic matching the background
  function drawBirdInstance(c: CanvasRenderingContext2D, b: ActiveBird) {
    c.save();
    c.translate(b.x, b.y);

    const sp = b.species;
    const baseScale = sp.sizeScale * 1.05;
    const outlineColor = "#223324";

    if (b.state === "entering" || b.state === "flying" || b.state === "exiting") {
      // Flying posture
      const dx = b.targetX - b.startX;
      const dy = b.targetY - b.startY;
      const baseAngle = Math.atan2(dy, Math.abs(dx)) * 0.38;
      c.rotate(b.facing * baseAngle);
      c.scale(b.facing * baseScale, baseScale);

      c.lineWidth = 1.6;
      c.lineJoin = "round";
      c.lineCap = "round";

      // Flying body
      c.fillStyle = sp.primaryColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.ellipse(0, 0, 15, 8, -0.12, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Belly
      c.fillStyle = sp.bellyColor;
      c.beginPath();
      c.ellipse(3, 3, 10, 4.5, -0.1, 0, Math.PI * 2);
      c.fill();

      // Flapping wings
      const flap = Math.sin(b.wingFlap) * sp.wingSpan;
      c.fillStyle = sp.accentColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.moveTo(-3, -2);
      c.lineTo(-7, -21 + flap);
      c.lineTo(6, -5);
      c.closePath();
      c.fill();
      c.stroke();

      // Tail
      c.fillStyle = sp.accentColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.moveTo(-13, 0);
      c.lineTo(-24, -3);
      c.lineTo(-22, 3);
      c.closePath();
      c.fill();
      c.stroke();

      // Head
      c.fillStyle = sp.primaryColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.arc(13, -4, 6.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Eye
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(15, -5, 2.0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#1e293b";
      c.beginPath();
      c.arc(15.5, -5, 1.0, 0, Math.PI * 2);
      c.fill();

      // Beak
      c.fillStyle = sp.beakColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.moveTo(18, -5);
      c.lineTo(25, -3.5);
      c.lineTo(18, -2);
      c.closePath();
      c.fill();
      c.stroke();
    } else {
      // Perched posture: claws clamped solidly to the perch top surface
      c.scale(b.facing * baseScale, baseScale);
      c.lineWidth = 1.6;
      c.lineJoin = "round";
      c.lineCap = "round";

      // Tail
      c.save();
      c.translate(-9, 4);
      c.rotate(0.35 + b.tailAngle);
      c.fillStyle = sp.accentColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-16, -2);
      c.lineTo(-17, 5);
      c.lineTo(0, 4);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();

      // Body
      const breatheShift = Math.sin(b.breathe) * 0.8;
      c.fillStyle = sp.primaryColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.ellipse(0, -6 + breatheShift, 13, 10, 0.32, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Belly
      c.fillStyle = sp.bellyColor;
      c.beginPath();
      c.ellipse(4, -3 + breatheShift, 8.5, 7, 0.2, 0, Math.PI * 2);
      c.fill();

      // Folded wing
      c.fillStyle = sp.accentColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.ellipse(-3, -7 + breatheShift, 9.5, 5.5, 0.42, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Head
      c.save();
      c.translate(7, -15 + breatheShift);
      c.rotate(b.headTilt);
      c.fillStyle = sp.primaryColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.arc(0, 0, 7.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Eye
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(2.5, -1.5, 2.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#0f172a";
      c.beginPath();
      c.arc(3.2, -1.5, 1.1, 0, Math.PI * 2);
      c.fill();

      // Beak
      c.fillStyle = sp.beakColor;
      c.strokeStyle = outlineColor;
      c.beginPath();
      c.moveTo(6.5, -2);
      c.lineTo(13.5, -0.5);
      c.lineTo(6.5, 1.5);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();

      // Claws firmly gripping the top edge of the solid object
      c.strokeStyle = outlineColor;
      c.lineWidth = 2.0;
      c.beginPath();
      c.moveTo(-2, 2);
      c.lineTo(-2, 7);
      c.lineTo(1, 7);
      c.moveTo(3, 2);
      c.lineTo(3, 7);
      c.lineTo(6, 7);
      c.stroke();
    }

    c.restore();
  }

  // Draw all active birds
  function drawAllBirds(c: CanvasRenderingContext2D) {
    for (const b of activeBirds) {
      drawBirdInstance(c, b);
    }
  }

  // Draw telephoto viewfinder lens cursor overlay
  function drawTelephotoLens(c: CanvasRenderingContext2D, width: number, height: number, time: number) {
    if (!isHoveringCanvas || lensPos.x < -100) return;

    const lx = lensPos.x;
    const ly = lensPos.y;
    const radius = getLensRadius();
    const zoom = zoomMultipliers[focalLength];

    c.save();

    // 1. Circular clipping mask for high-magnification optic
    c.beginPath();
    c.arc(lx, ly, radius, 0, Math.PI * 2);
    c.clip();

    // Magnify scene inside lens: scale from lens center
    c.save();
    c.translate(lx, ly);
    c.scale(zoom, zoom);
    c.translate(-lx, -ly);

    // Re-render scene layers inside telephoto optic
    drawForestBackground(c, width, height);
    drawSolidPerches(c, time);
    drawAllBirds(c);

    c.restore();

    // 2. Optical Glass Treatment: Vignette & subtle edge aberration
    const glassGrad = c.createRadialGradient(lx, ly, radius * 0.45, lx, ly, radius);
    glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.02)");
    glassGrad.addColorStop(0.72, "rgba(20, 35, 25, 0.05)");
    glassGrad.addColorStop(1, "rgba(0, 0, 0, 0.48)");
    c.fillStyle = glassGrad;
    c.beginPath();
    c.arc(lx, ly, radius, 0, Math.PI * 2);
    c.fill();

    // 3. Viewfinder Reticle & HUD overlay
    const isLocked = lockedBird !== null;
    const reticleColor = isDoubleLocked ? "#38bdf8" : isLocked ? "#facc15" : "rgba(244, 241, 234, 0.7)";
    const bracketSize = 18;

    // Rule-of-thirds fine grid
    c.strokeStyle = "rgba(244, 241, 234, 0.18)";
    c.lineWidth = 1.0;
    c.beginPath();
    c.moveTo(lx - radius * 0.8, ly - radius * 0.33);
    c.lineTo(lx + radius * 0.8, ly - radius * 0.33);
    c.moveTo(lx - radius * 0.8, ly + radius * 0.33);
    c.lineTo(lx + radius * 0.8, ly + radius * 0.33);
    c.moveTo(lx - radius * 0.33, ly - radius * 0.8);
    c.lineTo(lx - radius * 0.33, ly + radius * 0.8);
    c.moveTo(lx + radius * 0.33, ly - radius * 0.8);
    c.lineTo(lx + radius * 0.33, ly + radius * 0.8);
    c.stroke();

    // Center crosshair
    c.strokeStyle = reticleColor;
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(lx - 8, ly);
    c.lineTo(lx + 8, ly);
    c.moveTo(lx, ly - 8);
    c.lineTo(lx + 8, ly);
    c.stroke();

    // Focus Lock Brackets: [  +  ]
    c.beginPath();
    c.moveTo(lx - bracketSize, ly - bracketSize + 7);
    c.lineTo(lx - bracketSize, ly - bracketSize);
    c.lineTo(lx - bracketSize + 7, ly - bracketSize);
    c.moveTo(lx + bracketSize - 7, ly - bracketSize);
    c.lineTo(lx + bracketSize, ly - bracketSize);
    c.lineTo(lx + bracketSize, ly - bracketSize + 7);
    c.moveTo(lx - bracketSize, ly + bracketSize - 7);
    c.lineTo(lx - bracketSize, ly + bracketSize);
    c.lineTo(lx - bracketSize + 7, ly + bracketSize);
    c.moveTo(lx + bracketSize - 7, ly + bracketSize);
    c.lineTo(lx + bracketSize, ly + bracketSize);
    c.lineTo(lx + bracketSize, ly + bracketSize - 7);
    c.stroke();

    // Focus Lock Notification
    if (isDoubleLocked) {
      c.fillStyle = "#38bdf8";
      c.beginPath();
      c.arc(lx, ly - bracketSize - 10, 3, 0, Math.PI * 2);
      c.fill();
      c.font = "bold 9px monospace";
      c.textAlign = "center";
      c.fillText("DUAL SPECIES IN FRAME", lx, ly - bracketSize - 16);
    } else if (isLocked) {
      c.fillStyle = "#eab308";
      c.beginPath();
      c.arc(lx, ly - bracketSize - 10, 3, 0, Math.PI * 2);
      c.fill();
      c.font = "bold 9px monospace";
      c.fillStyle = "#facc15";
      c.textAlign = "center";
      c.fillText(`AF-LOCK: ${lockedBird?.toUpperCase()}`, lx, ly - bracketSize - 16);
    }

    // Telephoto bottom HUD strip inside lens
    c.font = "600 10px monospace";
    c.fillStyle = "rgba(244, 241, 234, 0.85)";
    c.textAlign = "center";
    c.fillText(`${focalLength} · f/2.8 · 1/2000s · ISO 200`, lx, ly + radius - 22);

    c.restore();

    // Outer Lens Barrel Ring
    c.save();
    c.lineWidth = 6;
    c.strokeStyle = "#162018";
    c.beginPath();
    c.arc(lx, ly, radius + 2, 0, Math.PI * 2);
    c.stroke();

    c.lineWidth = 1.8;
    c.strokeStyle = isDoubleLocked ? "#38bdf8" : isLocked ? "#facc15" : "rgba(180, 205, 185, 0.55)";
    c.beginPath();
    c.arc(lx, ly, radius + 5, 0, Math.PI * 2);
    c.stroke();

    c.restore();
  }

  // Main render frame
  function render(time: number) {
    if (!canvas || !ctx) return;
    const dt = lastTime === 0 ? 0.016 : Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;

    const width = canvas.width;
    const height = canvas.height;

    update(dt);

    ctx.clearRect(0, 0, width, height);

    // 1. Draw clean background
    drawForestBackground(ctx, width, height);
    // 2. Draw solid physical perches, branches, fence post, rock
    drawSolidPerches(ctx, time * 0.001);
    // 3. Draw birds firmly perched or in flight
    drawAllBirds(ctx);

    // 4. Magnified telephoto optic pass
    drawTelephotoLens(ctx, width, height, time * 0.001);

    animationFrameId = requestAnimationFrame(render);
  }

  // Handle snapping photo
  function snapPhoto() {
    if (!canvas) return;

    playShutterSound();

    shutterFlash = true;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = window.setTimeout(() => {
      shutterFlash = false;
    }, 130);

    const radius = getLensRadius();
    const capturedBirds = activeBirds.filter((b) => {
      const dist = Math.hypot(lensPos.x - b.x, lensPos.y - b.y);
      return dist < radius * 0.95;
    });

    let shotSubject = "Lush Forest Clearing";
    let shotStatus = "Woodland Canopy View";
    let shotQuality = "Scenic Landscape";
    let isDouble = false;

    if (capturedBirds.length >= 2) {
      isDouble = true;
      shotSubject = `${capturedBirds[0].species.name} & ${capturedBirds[1].species.name}`;
      shotStatus = "Rare Companion Flock Encounter";
      shotQuality = "Exceptional Double Sighting";
    } else if (capturedBirds.length === 1) {
      const b = capturedBirds[0];
      const p = solidPerches[b.perchIndex];
      shotSubject = b.species.name;
      const dist = Math.hypot(lensPos.x - b.x, lensPos.y - b.y);
      if (dist < radius * 0.35) {
        shotStatus = b.state === "flying" || b.state === "entering" || b.state === "exiting"
          ? "Tack-Sharp Mid-Flight Wing Action"
          : `Tack-Sharp Portrait on ${p ? p.name : 'Branch'}`;
        shotQuality = "Masterful Focus";
      } else {
        shotStatus = b.state === "flying" || b.state === "entering" || b.state === "exiting"
          ? "In-Flight Canopy Swoop"
          : `Perched on ${p ? p.name : 'Branch'}`;
        shotQuality = "Clean Composition";
      }
    }

    // High resolution telephoto crop
    const cropCanvas = document.createElement("canvas");
    const cropSize = 720;
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    const cCtx = cropCanvas.getContext("2d");

    if (cCtx) {
      const zoom = zoomMultipliers[focalLength];
      cCtx.save();
      cCtx.translate(cropSize / 2, cropSize / 2);
      cCtx.scale(zoom, zoom);
      cCtx.translate(-lensPos.x, -lensPos.y);

      drawForestBackground(cCtx, canvas.width, canvas.height);
      drawSolidPerches(cCtx, performance.now() * 0.001);
      drawAllBirds(cCtx);
      cCtx.restore();

      // Film vignette
      const vGrad = cCtx.createRadialGradient(
        cropSize / 2,
        cropSize / 2,
        cropSize * 0.35,
        cropSize / 2,
        cropSize / 2,
        cropSize * 0.72
      );
      vGrad.addColorStop(0, "rgba(0,0,0,0)");
      vGrad.addColorStop(1, "rgba(4, 10, 6, 0.45)");
      cCtx.fillStyle = vGrad;
      cCtx.fillRect(0, 0, cropSize, cropSize);

      // EXIF watermark on photo bottom
      cCtx.fillStyle = "rgba(244, 241, 234, 0.9)";
      cCtx.font = "14px monospace";
      cCtx.textAlign = "left";
      cCtx.fillText(`${shotSubject} · ${focalLength} f/2.8 · 1/2000s`, 24, cropSize - 24);

      const dataUrl = cropCanvas.toDataURL("image/jpeg", 0.92);
      const photo: CapturedPhoto = {
        id: "snap-" + Date.now(),
        dataUrl,
        subject: shotSubject,
        status: shotStatus,
        focalLength,
        iso: "ISO 200",
        shutter: "1/2000s",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        quality: shotQuality,
        isDouble,
      };

      recentSnap = photo;
      fieldRoll = [photo, ...fieldRoll];

      if (snapToastTimer) clearTimeout(snapToastTimer);
      snapToastTimer = window.setTimeout(() => {
        recentSnap = null;
      }, 4200);
    }
  }

  // Mouse event handlers
  function handleMouseMove(e: MouseEvent) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    isHoveringCanvas = true;
  }

  function handleMouseEnter() {
    isHoveringCanvas = true;
  }

  function handleMouseLeave() {
    isHoveringCanvas = false;
  }

  function handleResize() {
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width < 820) return;
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(Math.min(window.innerHeight * 0.72, rect.width * (476 / 910), 620));
    initForest(canvas.width, canvas.height);
  }

  onMount(() => {
    // Load clean background illustration (without static bird)
    bgImage = new Image();
    bgImage.src = "/assets/aistudio/forest_clearing_nobird.png";
    bgImage.onload = () => {
      isBgLoaded = true;
    };

    if (canvas) {
      ctx = canvas.getContext("2d");
      handleResize();
      window.addEventListener("resize", handleResize);
      animationFrameId = requestAnimationFrame(render);
    }
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (flashTimer) clearTimeout(flashTimer);
      if (snapToastTimer) clearTimeout(snapToastTimer);
    }
  });
</script>

<div class="birdwatch-page" bind:this={container}>
  <!-- Mobile notice: Informs mobile visitors that telephoto viewfinder requires desktop mouse -->
  <div class="mobile-notice-card">
    <div class="notice-emblem" aria-hidden="true">🔭</div>
    <span class="notice-kicker">Desktop Telephoto Sanctuary</span>
    <h2 class="notice-title">Bird Watch Minigame</h2>
    <p class="notice-desc">
      The telephoto camera viewfinder relies on precision cursor optics and motion tracking designed specifically for a desktop or laptop mouse.
    </p>
    <p class="notice-sub">
      Please visit from a computer to explore the woodland canopy and photograph wild birds!
    </p>
    <div class="notice-actions">
      <a href="/Photography" class="notice-btn primary">
        📷 View Nature Photography
      </a>
      <a href="/" class="notice-btn secondary">
        🌲 Return to Home Base
      </a>
    </div>
  </div>

  <!-- Desktop Game Layout -->
  <div class="desktop-expedition-wrap">
    <!-- Top Control HUD Bar -->
    <header class="camera-hud-bar">
    <div class="hud-left">
      <div class="hud-brand">
        <span class="hud-camera-icon" aria-hidden="true">📷</span>
        <div class="hud-title-wrap">
          <h1 class="hud-title">Forest Sanctuary · Telephoto Expedition</h1>
          <p class="hud-subtitle">Woodland canopy frame · Birds perch on branches & posts, visit, and depart</p>
        </div>
      </div>
    </div>

    <!-- Telephoto & Sanctuary Controls -->
    <div class="hud-controls">
      <div class="control-cluster">
        <span class="cluster-label">Optics</span>
        <div class="segmented-pills">
          <button
            class="pill-btn {focalLength === '200mm' ? 'active' : ''}"
            onclick={() => (focalLength = "200mm")}
          >
            200mm
          </button>
          <button
            class="pill-btn {focalLength === '400mm' ? 'active' : ''}"
            onclick={() => (focalLength = "400mm")}
          >
            400mm
          </button>
          <button
            class="pill-btn {focalLength === '600mm' ? 'active' : ''}"
            onclick={() => (focalLength = "600mm")}
          >
            600mm
          </button>
        </div>
      </div>

      <!-- Quick Summon / Companion Call -->
      <div class="control-cluster">
        <button
          class="companion-call-btn"
          onclick={() => {
            const existingIds = new Set(activeBirds.map((b) => b.species.id));
            const available = speciesList.filter((s) => !existingIds.has(s.id));
            const nextSpecies = available.length > 0 ? available[0] : speciesList[0];
            spawnBird(nextSpecies);
          }}
          title="Attract another visiting bird to the canopy"
        >
          <span>🌿 Attract Bird</span>
          <span class="active-count-badge">
            {activeBirds.length} in view
          </span>
        </button>
      </div>

      <div class="control-cluster">
        <span class="cluster-label">Light</span>
        <div class="segmented-pills">
          <button
            class="pill-btn {atmosphere === 'natural' ? 'active' : ''}"
            onclick={() => (atmosphere = "natural")}
          >
            Natural
          </button>
          <button
            class="pill-btn {atmosphere === 'golden' ? 'active' : ''}"
            onclick={() => (atmosphere = "golden")}
          >
            Golden
          </button>
          <button
            class="pill-btn {atmosphere === 'twilight' ? 'active' : ''}"
            onclick={() => (atmosphere = "twilight")}
          >
            Dusk
          </button>
        </div>
      </div>

      <button
        class="mute-btn {isMuted ? 'muted' : ''}"
        onclick={() => (isMuted = !isMuted)}
        title={isMuted ? "Unmute Shutter Sound" : "Mute Shutter Sound"}
        aria-label="Toggle mechanical shutter audio"
      >
        {isMuted ? "🔇 Shutter Off" : "🔊 Shutter On"}
      </button>
    </div>
  </header>

  <!-- Forest Viewport with Viewfinder Overlay -->
  <div class="canvas-stage-wrapper">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="canvas-container"
      onclick={snapPhoto}
      onmousemove={handleMouseMove}
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
      role="region"
      aria-label="Lush forest observation scene. Click anywhere to snap a photo."
    >
      <canvas bind:this={canvas} class="forest-canvas"></canvas>

      <!-- Mechanical Shutter Blade Flash -->
      {#if shutterFlash}
        <div class="shutter-flash-overlay"></div>
      {/if}

      <!-- Top Viewfinder Telemetry Strip -->
      <div class="camera-viewfinder-status">
        <div class="status-left">
          <span class="live-rec-badge">CANOPY HIDE</span>
          <span class="mono-meta">{focalLength} PRIME</span>
          <span class="mono-meta">f/2.8 1/2000s</span>
          {#if isDoubleLocked}
            <span class="lock-indicator rare-glow">★ DUAL SPECIES IN SIGHT</span>
          {:else if lockedBird}
            <span class="lock-indicator">● TRACKING: {lockedBird}</span>
          {/if}
        </div>
        <div class="status-right">
          <span class="shutter-prompt">Click to Snap Photo</span>
        </div>
      </div>

      <!-- Active Species In-Canopy Pills -->
      <div class="active-species-pill-strip">
        {#each activeBirds as b (b.id)}
          <div class="active-bird-pill">
            <span
              class="bird-color-dot"
              style="background-color: {b.species.primaryColor};"
            ></span>
            <span class="bird-pill-name">{b.species.name}</span>
            <span class="bird-pill-state">
              {b.state === 'exiting' ? 'Departing...' : b.state === 'entering' ? 'Arriving...' : b.state === 'flying' ? 'Flitting' : 'Perched'}
            </span>
          </div>
        {/each}
      </div>

      <!-- Instant Snap Pop-up Card -->
      {#if recentSnap}
        <div class="instant-snap-card">
          <div class="snap-img-frame">
            <img src={recentSnap.dataUrl} alt="Captured photograph of {recentSnap.subject}" />
            {#if recentSnap.isDouble}
              <span class="snap-badge rare-badge">⭐ RARE DOUBLE SIGHTING</span>
            {:else}
              <span class="snap-badge">{recentSnap.quality}</span>
            {/if}
          </div>
          <div class="snap-details">
            <div class="snap-title-row">
              <h3>{recentSnap.subject}</h3>
              <span class="snap-time">{recentSnap.time}</span>
            </div>
            <p class="snap-desc">{recentSnap.status}</p>
            <div class="snap-actions">
              <button
                class="inspect-btn"
                onclick={(e) => {
                  e.stopPropagation();
                  inspectedPhoto = recentSnap;
                }}
              >
                Inspect Crop
              </button>
              <button
                class="dismiss-btn"
                onclick={(e) => {
                  e.stopPropagation();
                  recentSnap = null;
                }}
                aria-label="Close snap preview"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Bottom Field Journal & Photo Roll Tray -->
  <section class="field-roll-section">
    <div class="roll-header">
      <div class="roll-title-group">
        <span class="journal-icon" aria-hidden="true">🎞️</span>
        <div>
          <h2>Expedition Field Roll</h2>
          <span class="roll-subtitle">
            {fieldRoll.length} {fieldRoll.length === 1 ? "capture" : "captures"} recorded in session
          </span>
        </div>
      </div>

      {#if fieldRoll.length > 0}
        <button
          class="clear-roll-btn"
          onclick={() => {
            fieldRoll = [];
            recentSnap = null;
          }}
        >
          Reset Roll
        </button>
      {/if}
    </div>

    {#if fieldRoll.length === 0}
      <div class="empty-roll-card">
        <span class="empty-icon" aria-hidden="true">🔭</span>
        <p class="empty-title">No photographs taken yet</p>
        <p class="empty-desc">
          Aim through the telephoto optic. Birds will visit, alight on branches and trail posts, and be joined by companion species!
        </p>
      </div>
    {:else}
      <div class="photo-roll-grid">
        {#each fieldRoll as photo (photo.id)}
          <button
            class="photo-roll-card"
            onclick={() => (inspectedPhoto = photo)}
            aria-label="Inspect photograph of {photo.subject}"
          >
            <div class="photo-thumbnail-wrap">
              <img src={photo.dataUrl} alt={photo.subject} />
              <span class="photo-time-tag">{photo.time}</span>
              {#if photo.isDouble}
                <span class="double-tag-star">★ Double</span>
              {/if}
            </div>
            <div class="photo-card-info">
              <span class="card-subject">{photo.subject}</span>
              <span class="card-status">{photo.status}</span>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </section>
  </div> <!-- end desktop-expedition-wrap -->

  <!-- High-Res Photo Lightbox Inspection Modal -->
  {#if inspectedPhoto}
    <div
      class="photo-modal-backdrop"
      onclick={() => (inspectedPhoto = null)}
      role="dialog"
      aria-modal="true"
      aria-label="Photograph details modal"
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div class="photo-modal-content" onclick={(e) => e.stopPropagation()} role="document">
        <button
          class="modal-close-btn"
          onclick={() => (inspectedPhoto = null)}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div class="modal-image-view">
          <img src={inspectedPhoto.dataUrl} alt="High resolution capture of {inspectedPhoto.subject}" />
        </div>

        <div class="modal-info-panel">
          <div class="modal-header">
            <span class="modal-kicker">
              {inspectedPhoto.isDouble ? "★ Rare Double Sighting Record" : "Field Journal Record"}
            </span>
            <h2>{inspectedPhoto.subject}</h2>
            <p class="modal-caption">{inspectedPhoto.status} · {inspectedPhoto.quality}</p>
          </div>

          <div class="exif-data-grid">
            <div class="exif-item">
              <span class="exif-label">Focal Length</span>
              <span class="exif-val">{inspectedPhoto.focalLength}</span>
            </div>
            <div class="exif-item">
              <span class="exif-label">Aperture</span>
              <span class="exif-val">f/2.8</span>
            </div>
            <div class="exif-item">
              <span class="exif-label">Shutter Speed</span>
              <span class="exif-val">{inspectedPhoto.shutter}</span>
            </div>
            <div class="exif-item">
              <span class="exif-label">Timestamp</span>
              <span class="exif-val">{inspectedPhoto.time}</span>
            </div>
          </div>

          <div class="modal-actions">
            <a
              href={inspectedPhoto.dataUrl}
              download="bryce-nature-photo-{inspectedPhoto.id}.jpg"
              class="download-photo-btn"
            >
              Save High-Res Snapshot
            </a>
            <button
              class="back-to-expedition-btn"
              onclick={() => (inspectedPhoto = null)}
            >
              Resume Expedition
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .birdwatch-page {
    max-width: 1320px;
    margin: 0 auto;
    padding: 1.25rem 1rem 3rem;
    animation: fadeIn 0.4s ease;
  }

  /* HUD Top Bar */
  .camera-hud-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    background: rgba(18, 29, 21, 0.85);
    border: 1px solid rgba(138, 171, 133, 0.22);
    border-radius: 14px;
    padding: 0.9rem 1.4rem;
    margin-bottom: 1.25rem;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  }

  .hud-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .hud-brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .hud-camera-icon {
    font-size: 1.6rem;
    background: rgba(30, 48, 35, 0.7);
    padding: 0.45rem 0.6rem;
    border-radius: 10px;
    border: 1px solid rgba(138, 171, 133, 0.3);
  }

  .hud-title-wrap .hud-title {
    font-family: var(--font-display, "Cinzel", serif);
    font-size: 1.18rem;
    font-weight: 700;
    color: #f7eed7;
    margin: 0 0 0.15rem;
    letter-spacing: 0.02em;
  }

  .hud-title-wrap .hud-subtitle {
    margin: 0;
    font-size: 0.82rem;
    color: #a3c4a2;
    font-family: var(--font-sans);
  }

  .hud-controls {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
  }

  .control-cluster {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .cluster-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8db888;
    font-weight: 600;
  }

  .segmented-pills {
    display: flex;
    background: rgba(10, 18, 13, 0.6);
    border: 1px solid rgba(138, 171, 133, 0.25);
    border-radius: 8px;
    padding: 2px;
  }

  .pill-btn {
    background: transparent;
    border: none;
    color: #c7d8be;
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.35rem 0.65rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .pill-btn:hover {
    color: #ffffff;
    background: rgba(138, 171, 133, 0.15);
  }

  .pill-btn.active {
    background: #d49a46;
    color: #0b140d;
    font-weight: 700;
    box-shadow: 0 2px 6px rgba(212, 154, 70, 0.3);
  }

  .companion-call-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(22, 38, 27, 0.75);
    border: 1px solid rgba(138, 171, 133, 0.3);
    color: #f7eed7;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.38rem 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .companion-call-btn:hover {
    background: rgba(35, 60, 42, 0.85);
    border-color: #d49a46;
    color: #ffffff;
  }

  .active-count-badge {
    background: rgba(10, 18, 13, 0.8);
    color: #e0aa53;
    font-family: monospace;
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    border: 1px solid rgba(212, 154, 70, 0.3);
  }

  .mute-btn {
    background: rgba(10, 18, 13, 0.6);
    border: 1px solid rgba(138, 171, 133, 0.25);
    color: #c7d8be;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.38rem 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .mute-btn:hover {
    color: #ffffff;
    background: rgba(30, 48, 35, 0.7);
  }

  .mute-btn.muted {
    color: #e57373;
    border-color: rgba(229, 115, 115, 0.3);
  }

  /* Canvas Viewport */
  .canvas-stage-wrapper {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(138, 171, 133, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
    background: #e3eff3;
  }

  .canvas-container {
    position: relative;
    width: 100%;
    height: clamp(500px, 70vh, 660px);
    cursor: crosshair;
    user-select: none;
  }

  .forest-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Shutter flash effect */
  .shutter-flash-overlay {
    position: absolute;
    inset: 0;
    background: rgba(245, 245, 240, 0.9);
    animation: flashFade 0.12s ease-out forwards;
    pointer-events: none;
    z-index: 50;
  }

  @keyframes flashFade {
    0% {
      opacity: 0.95;
    }
    100% {
      opacity: 0;
    }
  }

  /* Top Viewfinder HUD overlay */
  .camera-viewfinder-status {
    position: absolute;
    top: 14px;
    left: 18px;
    right: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
    z-index: 20;
  }

  .status-left {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    font-family: monospace;
    font-size: 0.76rem;
    background: rgba(6, 12, 8, 0.75);
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    border: 1px solid rgba(138, 171, 133, 0.2);
    backdrop-filter: blur(6px);
  }

  .live-rec-badge {
    color: #4ade80;
    font-weight: 700;
  }

  .mono-meta {
    color: #c7d8be;
  }

  .lock-indicator {
    color: #facc15;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .lock-indicator.rare-glow {
    color: #38bdf8;
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
  }

  .status-right .shutter-prompt {
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 600;
    color: #f7eed7;
    background: rgba(212, 154, 70, 0.85);
    color: #0b140d;
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  /* Active Species In-Canopy Pills */
  .active-species-pill-strip {
    position: absolute;
    bottom: 16px;
    left: 18px;
    display: flex;
    gap: 0.5rem;
    pointer-events: none;
    z-index: 20;
    flex-wrap: wrap;
  }

  .active-bird-pill {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    background: rgba(10, 18, 13, 0.82);
    border: 1px solid rgba(138, 171, 133, 0.3);
    border-radius: 20px;
    padding: 0.28rem 0.75rem;
    backdrop-filter: blur(6px);
  }

  .bird-color-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .bird-pill-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #f7eed7;
  }

  .bird-pill-state {
    font-size: 0.68rem;
    color: #8db888;
    font-family: monospace;
  }

  /* Instant Snap Preview Card */
  .instant-snap-card {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 290px;
    background: rgba(14, 24, 18, 0.92);
    border: 1px solid rgba(138, 171, 133, 0.35);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    z-index: 40;
    animation: slideUpSnap 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUpSnap {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .snap-img-frame {
    position: relative;
    width: 100%;
    height: 160px;
    background: #080f0a;
  }

  .snap-img-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .snap-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(10, 18, 13, 0.85);
    color: #d49a46;
    font-family: monospace;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(212, 154, 70, 0.4);
  }

  .snap-badge.rare-badge {
    background: rgba(12, 28, 38, 0.9);
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.5);
  }

  .snap-details {
    padding: 0.85rem 1rem 1rem;
  }

  .snap-title-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.25rem;
  }

  .snap-title-row h3 {
    margin: 0;
    font-size: 0.95rem;
    color: #f7eed7;
    font-weight: 700;
  }

  .snap-time {
    font-family: monospace;
    font-size: 0.72rem;
    color: #8db888;
  }

  .snap-desc {
    margin: 0 0 0.85rem;
    font-size: 0.8rem;
    color: #a3c4a2;
  }

  .snap-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .inspect-btn {
    flex: 1;
    background: #d49a46;
    border: none;
    color: #0b140d;
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.45rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .inspect-btn:hover {
    background: #e5aa55;
  }

  .dismiss-btn {
    background: transparent;
    border: 1px solid rgba(138, 171, 133, 0.25);
    color: #c7d8be;
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .dismiss-btn:hover {
    color: #ffffff;
    background: rgba(138, 171, 133, 0.15);
  }

  /* Bottom Field Roll */
  .field-roll-section {
    margin-top: 2rem;
    background: rgba(18, 29, 21, 0.65);
    border: 1px solid rgba(138, 171, 133, 0.18);
    border-radius: 16px;
    padding: 1.5rem 1.75rem;
    backdrop-filter: blur(8px);
  }

  .roll-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .roll-title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .journal-icon {
    font-size: 1.5rem;
  }

  .roll-title-group h2 {
    font-family: var(--font-display, "Cinzel", serif);
    font-size: 1.25rem;
    margin: 0;
    color: #f7eed7;
  }

  .roll-subtitle {
    font-size: 0.82rem;
    color: #8db888;
  }

  .clear-roll-btn {
    background: transparent;
    border: 1px solid rgba(138, 171, 133, 0.25);
    color: #a3c4a2;
    font-size: 0.78rem;
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .clear-roll-btn:hover {
    color: #ff9999;
    border-color: rgba(255, 153, 153, 0.4);
  }

  .empty-roll-card {
    text-align: center;
    padding: 2.5rem 1.5rem;
    background: rgba(12, 20, 15, 0.5);
    border: 1px dashed rgba(138, 171, 133, 0.2);
    border-radius: 12px;
  }

  .empty-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .empty-title {
    margin: 0 0 0.25rem;
    font-size: 1.05rem;
    color: #f7eed7;
    font-weight: 600;
  }

  .empty-desc {
    margin: 0;
    font-size: 0.85rem;
    color: #8db888;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }

  .photo-roll-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .photo-roll-card {
    background: rgba(12, 20, 15, 0.7);
    border: 1px solid rgba(138, 171, 133, 0.22);
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    transition: transform 0.2s ease, border-color 0.2s ease;
    padding: 0;
  }

  .photo-roll-card:hover {
    transform: translateY(-3px);
    border-color: #d49a46;
  }

  .photo-thumbnail-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    background: #080f0a;
  }

  .photo-thumbnail-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-time-tag {
    position: absolute;
    bottom: 6px;
    right: 6px;
    background: rgba(0, 0, 0, 0.75);
    color: #e0aa53;
    font-family: monospace;
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
  }

  .double-tag-star {
    position: absolute;
    top: 6px;
    left: 6px;
    background: rgba(14, 38, 52, 0.85);
    color: #38bdf8;
    font-family: monospace;
    font-size: 0.65rem;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    border: 1px solid rgba(56, 189, 248, 0.4);
    font-weight: 700;
  }

  .photo-card-info {
    padding: 0.65rem 0.75rem;
  }

  .card-subject {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: #f7eed7;
    margin-bottom: 0.15rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-status {
    display: block;
    font-size: 0.75rem;
    color: #8db888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Modal Lightbox */
  .photo-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(5, 10, 7, 0.85);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 100;
    animation: fadeIn 0.2s ease;
  }

  .photo-modal-content {
    position: relative;
    display: flex;
    flex-direction: row;
    max-width: 900px;
    width: 100%;
    background: #0f1c14;
    border: 1px solid rgba(138, 171, 133, 0.35);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  }

  .modal-close-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    background: rgba(10, 18, 13, 0.8);
    border: 1px solid rgba(138, 171, 133, 0.3);
    color: #f7eed7;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .modal-close-btn:hover {
    background: #d49a46;
    color: #0b140d;
  }

  .modal-image-view {
    flex: 1.2;
    background: #080e0a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-image-view img {
    max-width: 100%;
    max-height: 520px;
    object-fit: contain;
    display: block;
  }

  .modal-info-panel {
    flex: 1;
    padding: 2.25rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .modal-kicker {
    display: inline-block;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #d49a46;
    font-weight: 700;
    margin-bottom: 0.4rem;
  }

  .modal-header h2 {
    font-family: var(--font-display, "Cinzel", serif);
    font-size: 1.6rem;
    margin: 0 0 0.4rem;
    color: #f7eed7;
  }

  .modal-caption {
    font-family: var(--font-serif, "Lora", serif);
    font-style: italic;
    font-size: 0.95rem;
    color: #a3c4a2;
    margin: 0;
  }

  .exif-data-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1.75rem 0;
    background: rgba(10, 18, 13, 0.6);
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid rgba(138, 171, 133, 0.2);
  }

  .exif-item .exif-label {
    display: block;
    font-size: 0.7rem;
    color: #8db888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.2rem;
  }

  .exif-item .exif-val {
    font-family: monospace;
    font-size: 0.88rem;
    color: #f7eed7;
    font-weight: 600;
  }

  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .download-photo-btn {
    display: block;
    text-align: center;
    background: #d49a46;
    color: #0b140d;
    font-weight: 700;
    font-size: 0.9rem;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .download-photo-btn:hover {
    background: #e5aa55;
  }

  .back-to-expedition-btn {
    background: transparent;
    border: 1px solid rgba(138, 171, 133, 0.3);
    color: #c7d8be;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.65rem 1.25rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .back-to-expedition-btn:hover {
    background: rgba(138, 171, 133, 0.15);
    color: #ffffff;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
    }
  }

  /* Mobile Notice Card */
  .mobile-notice-card {
    display: none;
    background: rgba(18, 29, 21, 0.9);
    border: 1px solid rgba(138, 171, 133, 0.3);
    border-radius: 18px;
    padding: 2.75rem 1.75rem;
    text-align: center;
    max-width: 480px;
    margin: 3rem auto 2rem;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(12px);
    animation: fadeIn 0.4s ease;
  }

  .notice-emblem {
    font-size: 3rem;
    margin-bottom: 0.75rem;
  }

  .notice-kicker {
    display: inline-block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #d49a46;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .notice-title {
    font-family: var(--font-display, "Cinzel", serif);
    font-size: 1.65rem;
    color: #f7eed7;
    margin: 0 0 0.85rem;
  }

  .notice-desc {
    font-size: 0.92rem;
    color: #d1dfcc;
    line-height: 1.6;
    margin: 0 0 0.75rem;
  }

  .notice-sub {
    font-size: 0.84rem;
    color: #8db888;
    line-height: 1.5;
    margin: 0 0 1.75rem;
  }

  .notice-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .notice-btn {
    display: block;
    padding: 0.8rem 1.25rem;
    border-radius: 8px;
    font-size: 0.88rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.15s ease;
    text-align: center;
  }

  .notice-btn.primary {
    background: #d49a46;
    color: #0b140d;
    box-shadow: 0 2px 8px rgba(212, 154, 70, 0.3);
  }

  .notice-btn.primary:hover {
    background: #e5aa55;
  }

  .notice-btn.secondary {
    background: transparent;
    color: #c7d8be;
    border: 1px solid rgba(138, 171, 133, 0.3);
  }

  .notice-btn.secondary:hover {
    color: #ffffff;
    background: rgba(138, 171, 133, 0.15);
  }

  /* Responsive Rules: Hide minigame completely on mobile / touch widths <= 820px */
  @media screen and (max-width: 820px) {
    .desktop-expedition-wrap {
      display: none !important;
    }
    .mobile-notice-card {
      display: block !important;
    }
  }

  @media screen and (min-width: 821px) {
    .mobile-notice-card {
      display: none !important;
    }
  }
</style>
