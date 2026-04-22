import { useRef, useEffect, useCallback } from 'react';
import { Application, Container, Graphics, Text, TextStyle, Ticker } from 'pixi.js';
import { getAllPlanets, getPlanetByName } from '../../utils/planets';
import { usePlanetStore } from '../../stores/usePlanetStore';
import { useRouteStore } from '../../stores/useRouteStore';
import { distanceLY } from '../../utils/coordinates';
import { REGION_DOT_COLORS } from '../../utils/constants';
import type { Planet } from '../../types';
import tradeRoutes from '../../data/trade-routes.json';
import regionsData from '../../data/regions.json';
import type { TradeRoute, Region } from '../../types';

// rgba(r, g, b, a) → { color: 0xrrggbb, alpha: a }
function parseRGBA(rgba: string): { color: number; alpha: number } {
  const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (!m) return { color: 0xefe7d4, alpha: 0.1 };
  const [r, g, b, a] = [Number(m[1]), Number(m[2]), Number(m[3]), m[4] !== undefined ? Number(m[4]) : 1];
  return { color: (r << 16) | (g << 8) | b, alpha: a };
}

const PIXELS_PER_GRID = 60;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 8;
const GALAXY_CENTER_X = 10;
const GALAXY_CENTER_Y = 10.5;

export function GalaxyMap() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const planetGfxRef = useRef<Map<string, Container>>(new Map());
  const routeLayerRef = useRef<Container | null>(null);
  const selectionLayerRef = useRef<Container | null>(null);
  const labelContainersRef = useRef<Map<string, Text>>(new Map());
  const shipTickerRef = useRef<Ticker | null>(null);
  const selectionTickerRef = useRef<Ticker | null>(null);
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const { selectedPlanets, selectPlanet, maxTier, speedSlider } = usePlanetStore();
  const { activeRouteId } = useRouteStore();

  // Refs for latest state (avoid stale closures)
  const selectPlanetRef = useRef(selectPlanet);
  selectPlanetRef.current = selectPlanet;
  const maxTierRef = useRef(maxTier);
  maxTierRef.current = maxTier;
  const selectedPlanetsRef = useRef(selectedPlanets);
  selectedPlanetsRef.current = selectedPlanets;
  const activeRouteIdRef = useRef(activeRouteId);
  activeRouteIdRef.current = activeRouteId;
  const speedSliderRef = useRef(speedSlider);
  speedSliderRef.current = speedSlider;

  const allPlanets = getAllPlanets();

  const gridToCanvas = useCallback((gx: number, gy: number) => ({
    x: gx * PIXELS_PER_GRID,
    y: gy * PIXELS_PER_GRID,
  }), []);

  // Initialize PixiJS
  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new Application();
    let destroyed = false;

    (async () => {
      await app.init({
        resizeTo: canvasRef.current!,
        background: 0x0a0912,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (destroyed) { app.destroy(); return; }

      canvasRef.current!.appendChild(app.canvas);
      appRef.current = app;

      // World container for pan/zoom
      const world = new Container();
      worldRef.current = world;
      app.stage.addChild(world);

      // Center the galaxy in the viewport
      const cw = app.screen.width;
      const ch = app.screen.height;
      const cx = GALAXY_CENTER_X * PIXELS_PER_GRID;
      const cy = GALAXY_CENTER_Y * PIXELS_PER_GRID;
      world.x = cw / 2 - cx;
      world.y = ch / 2 - cy;

      // --- Region bands — colored concentric discs, largest first so
      // inner regions paint over outer (matches the 3D galaxy-plane texture).
      const regionLayer = new Container();
      world.addChild(regionLayer);
      const centerPx = gridToCanvas(GALAXY_CENTER_X, GALAXY_CENTER_Y);
      const regions = regionsData as Region[];
      for (const region of [...regions].reverse()) {
        const outerR = region.outerRadius * PIXELS_PER_GRID;
        const { color, alpha } = parseRGBA(region.color);
        const band = new Graphics();
        band.circle(centerPx.x, centerPx.y, outerR);
        band.fill({ color, alpha });
        regionLayer.addChild(band);

        // Thin ring outline at region boundary
        const ring = new Graphics();
        ring.circle(centerPx.x, centerPx.y, outerR);
        ring.stroke({ width: 0.8, color, alpha: Math.min(1, alpha * 3) });
        regionLayer.addChild(ring);
      }
      // Labels drawn on top of all bands
      for (const region of regions) {
        const outerR = region.outerRadius * PIXELS_PER_GRID;
        const labelAngle = -Math.PI / 4;
        const label = new Text({
          text: region.name.toUpperCase(),
          style: new TextStyle({
            fontSize: 9,
            fill: 0xefe7d4,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            letterSpacing: 2.4,
          }),
        });
        label.alpha = 0.32;
        label.anchor.set(0.5, 1);
        label.x = centerPx.x + Math.cos(labelAngle) * outerR;
        label.y = centerPx.y + Math.sin(labelAngle) * outerR;
        label.rotation = labelAngle + Math.PI / 2;
        regionLayer.addChild(label);
      }

      // --- Route layer ---
      const routeLayer = new Container();
      routeLayerRef.current = routeLayer;
      world.addChild(routeLayer);

      // --- Planet layer ---
      const planetLayer = new Container();
      world.addChild(planetLayer);

      for (const planet of allPlanets) {
        const pos = gridToCanvas(planet.trueX, planet.trueY);
        const container = new Container();
        container.x = pos.x;
        container.y = pos.y;
        container.eventMode = 'static';
        container.cursor = 'pointer';

        // Dot — colored by region, size + alpha drop with tier
        const dot = new Graphics();
        const size = planet.tier === 1 ? 2.8 : planet.tier === 2 ? 1.9 : planet.tier === 3 ? 1.2 : 0.8;
        const alpha = planet.tier === 1 ? 1 : planet.tier === 2 ? 0.85 : planet.tier === 3 ? 0.6 : 0.4;
        const dotColor = REGION_DOT_COLORS[planet.Region] ?? 0xefe7d4;

        if (planet.tier === 1) {
          // Region-colored glow for prominent worlds
          const glow = new Graphics();
          glow.circle(0, 0, size * 3);
          glow.fill({ color: dotColor, alpha: 0.18 });
          container.addChild(glow);
        }

        dot.circle(0, 0, size);
        dot.fill({ color: dotColor, alpha });
        container.addChild(dot);

        // Label
        const label = new Text({
          text: planet.Name,
          style: new TextStyle({
            fontSize: planet.tier === 1 ? 10 : 8,
            fill: 0xefe7d4,
            fontFamily: 'Inter, system-ui, sans-serif',
            dropShadow: { blur: 3, color: 0x0a0912, distance: 0 },
          }),
        });
        label.anchor.set(0, 0.5);
        label.x = size + 4;
        label.visible = planet.tier === 1;
        container.addChild(label);
        labelContainersRef.current.set(planet.Name, label);

        // Hover
        container.on('pointerover', () => {
          label.visible = true;
          dot.scale.set(1.5);
        });
        container.on('pointerout', () => {
          const tier = (planet as Planet).tier;
          const zoom = worldRef.current?.scale.x || 1;
          label.visible = shouldShowLabel(tier, zoom, maxTierRef.current);
          dot.scale.set(1);
        });

        // Click
        container.on('pointertap', (e) => {
          e.stopPropagation();
          selectPlanetRef.current(planet);
        });

        // Hit area — bigger for small dots
        container.hitArea = { contains: (x: number, y: number) => x * x + y * y < 100 };

        planetGfxRef.current.set(planet.Name, container);
        planetLayer.addChild(container);
      }

      // --- Selection layer ---
      const selectionLayer = new Container();
      selectionLayerRef.current = selectionLayer;
      world.addChild(selectionLayer);

      // --- Pan/Zoom ---
      app.canvas.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? -1 : 1;
        const factor = 1 + dir * 0.15;
        const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, world.scale.x * factor));

        // Zoom toward cursor
        const rect = app.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const worldX = (mx - world.x) / world.scale.x;
        const worldY = (my - world.y) / world.scale.y;

        world.scale.set(newScale);
        world.x = mx - worldX * newScale;
        world.y = my - worldY * newScale;

        updateLabelVisibility(newScale);
      }, { passive: false });

      app.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
        isPanningRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('pointermove', (e: PointerEvent) => {
        if (!isPanningRef.current) return;
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        world.x += dx;
        world.y += dy;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('pointerup', () => {
        isPanningRef.current = false;
      });
    })();

    return () => {
      destroyed = true;
      appRef.current?.destroy(true);
      appRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update label visibility when maxTier changes
  useEffect(() => {
    const zoom = worldRef.current?.scale.x || 1;
    updateLabelVisibility(zoom);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxTier]);

  // Update planet visibility when maxTier changes
  useEffect(() => {
    for (const planet of allPlanets) {
      const container = planetGfxRef.current.get(planet.Name);
      if (container) {
        container.visible = planet.tier <= maxTier;
      }
    }
  }, [maxTier, allPlanets]);

  // Draw selection highlights + ship animation between selected planets
  useEffect(() => {
    const layer = selectionLayerRef.current;
    if (!layer) return;
    layer.removeChildren();

    // Clean up previous selection animation
    if (selectionTickerRef.current) {
      selectionTickerRef.current.destroy();
      selectionTickerRef.current = null;
    }

    const [a, b] = selectedPlanets;
    for (const planet of [a, b]) {
      if (!planet) continue;
      const pos = gridToCanvas(planet.trueX, planet.trueY);
      const ring = new Graphics();
      ring.circle(pos.x, pos.y, 12);
      ring.stroke({ width: 1.5, color: 0xd9641f });
      layer.addChild(ring);
    }

    if (a && b) {
      const pa = gridToCanvas(a.trueX, a.trueY);
      const pb = gridToCanvas(b.trueX, b.trueY);
      const line = new Graphics();
      line.moveTo(pa.x, pa.y);
      line.lineTo(pb.x, pb.y);
      line.stroke({ width: 1.5, color: 0xd9641f, alpha: 0.6 });
      layer.addChild(line);

      // Distance label (ly, via the shared coordinate util)
      const dist = distanceLY(a, b);
      const midX = (pa.x + pb.x) / 2;
      const midY = (pa.y + pb.y) / 2;
      const distLabel = new Text({
        text: `${Math.round(dist).toLocaleString()} ly`,
        style: new TextStyle({
          fontSize: 11,
          fill: 0xd9641f,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          letterSpacing: 1.2,
          dropShadow: { blur: 4, color: 0x0a0912, distance: 0 },
        }),
      });
      distLabel.anchor.set(0.5);
      distLabel.x = midX;
      distLabel.y = midY - 12;
      layer.addChild(distLabel);

      // --- Starship animation along selection path ---
      // Suppressed when a route is active: the route-layer ticker already
      // animates a ship along the full route, and for 2-planet routes both
      // animations would overlap exactly.
      if (!activeRouteId) {
        const dx = pb.x - pa.x;
        const dy = pb.y - pa.y;
        const angle = Math.atan2(dy, dx);

        const ship = new Graphics();
        ship.moveTo(6, 0);
        ship.lineTo(-4, -3.5);
        ship.lineTo(-2, 0);
        ship.lineTo(-4, 3.5);
        ship.closePath();
        ship.fill({ color: 0xefe7d4 });
        ship.rotation = angle;
        layer.addChild(ship);

        const trail = new Graphics();
        layer.addChild(trail);

        let progress = 0;

        const ticker = new Ticker();
        ticker.add((tick) => {
          const animSpeed = 0.05 + speedSliderRef.current * 0.55;
          progress += (tick.deltaMS / 1000) * animSpeed;
          if (progress > 1) progress -= 1;

          const x = pa.x + dx * progress;
          const y = pa.y + dy * progress;
          ship.x = x;
          ship.y = y;

          const trailLen = 0.08;
          const trailStart = Math.max(0, progress - trailLen);
          trail.clear();
          trail.moveTo(pa.x + dx * trailStart, pa.y + dy * trailStart);
          trail.lineTo(x, y);
          trail.stroke({ width: 2, color: 0xd9641f, alpha: 0.4 });
        });
        ticker.start();
        selectionTickerRef.current = ticker;
      }
    }

    return () => {
      if (selectionTickerRef.current) {
        selectionTickerRef.current.destroy();
        selectionTickerRef.current = null;
      }
    };
  }, [selectedPlanets, activeRouteId, gridToCanvas]);

  // Draw active route with starship animation
  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.removeChildren();

    // Clean up previous animation ticker
    if (shipTickerRef.current) {
      shipTickerRef.current.destroy();
      shipTickerRef.current = null;
    }

    if (!activeRouteId) return;

    const route = (tradeRoutes as TradeRoute[]).find((r) => r.id === activeRouteId);
    if (!route) return;

    const points: { x: number; y: number }[] = [];
    for (const name of route.planets) {
      const planet = getPlanetByName(name);
      if (planet) {
        points.push(gridToCanvas(planet.trueX, planet.trueY));
      }
    }

    if (points.length < 2) return;

    const color = parseInt(route.color.replace('#', ''), 16);

    // Glow line
    const glow = new Graphics();
    glow.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      glow.lineTo(points[i].x, points[i].y);
    }
    glow.stroke({ width: 6, color, alpha: 0.2 });
    layer.addChild(glow);

    // Main line
    const line = new Graphics();
    line.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      line.lineTo(points[i].x, points[i].y);
    }
    line.stroke({ width: 2, color, alpha: 0.8 });
    layer.addChild(line);

    // --- Starship animation (Uber-style) ---
    // Calculate total path length and segment lengths
    const segLengths: number[] = [];
    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      segLengths.push(len);
      totalLength += len;
    }

    // Ship graphic — small triangle
    const ship = new Graphics();
    ship.moveTo(6, 0);
    ship.lineTo(-4, -3.5);
    ship.lineTo(-2, 0);
    ship.lineTo(-4, 3.5);
    ship.closePath();
    ship.fill({ color: 0xffffff });
    layer.addChild(ship);

    // Trail glow behind ship
    const trail = new Graphics();
    layer.addChild(trail);

    // Animate using a dedicated ticker
    let progress = 0; // 0 to 1 along the full path

    const ticker = new Ticker();
    ticker.add((tick) => {
      const animSpeed = 0.05 + speedSliderRef.current * 0.55;
      progress += (tick.deltaMS / 1000) * animSpeed;
      if (progress > 1) progress -= 1; // loop

      // Find position along path
      let targetDist = progress * totalLength;
      let segIdx = 0;
      while (segIdx < segLengths.length - 1 && targetDist > segLengths[segIdx]) {
        targetDist -= segLengths[segIdx];
        segIdx++;
      }

      const t = segLengths[segIdx] > 0 ? targetDist / segLengths[segIdx] : 0;
      const p0 = points[segIdx];
      const p1 = points[segIdx + 1];
      const x = p0.x + (p1.x - p0.x) * t;
      const y = p0.y + (p1.y - p0.y) * t;

      ship.x = x;
      ship.y = y;
      ship.rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);

      // Draw trail
      trail.clear();
      const trailLength = 0.05; // fraction of total path
      const trailStart = Math.max(0, progress - trailLength);
      const trailPoints: { x: number; y: number; alpha: number }[] = [];
      for (let s = 0; s <= 8; s++) {
        const tp = trailStart + (progress - trailStart) * (s / 8);
        let td = tp * totalLength;
        let si = 0;
        while (si < segLengths.length - 1 && td > segLengths[si]) {
          td -= segLengths[si];
          si++;
        }
        const tt = segLengths[si] > 0 ? td / segLengths[si] : 0;
        trailPoints.push({
          x: points[si].x + (points[si + 1].x - points[si].x) * tt,
          y: points[si].y + (points[si + 1].y - points[si].y) * tt,
          alpha: s / 8,
        });
      }

      if (trailPoints.length >= 2) {
        trail.moveTo(trailPoints[0].x, trailPoints[0].y);
        for (let i = 1; i < trailPoints.length; i++) {
          trail.lineTo(trailPoints[i].x, trailPoints[i].y);
        }
        trail.stroke({ width: 2, color, alpha: 0.5 });
      }
    });
    ticker.start();
    shipTickerRef.current = ticker;

    return () => {
      ticker.destroy();
      shipTickerRef.current = null;
    };
  }, [activeRouteId, gridToCanvas]);

  function updateLabelVisibility(zoom: number) {
    for (const planet of allPlanets) {
      const label = labelContainersRef.current.get(planet.Name);
      if (label) {
        label.visible = shouldShowLabel(planet.tier, zoom, maxTierRef.current);
      }
    }
  }

  return <div ref={canvasRef} className="w-full h-full" />;
}

function shouldShowLabel(tier: 1 | 2 | 3 | 4, zoom: number, maxTier: number): boolean {
  if (tier > maxTier) return false;
  if (tier === 1) return true;
  if (tier === 2) return zoom >= 1.5;
  if (tier === 3) return zoom >= 3;
  return zoom >= 5;
}

