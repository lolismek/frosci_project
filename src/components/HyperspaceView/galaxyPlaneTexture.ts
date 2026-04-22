import { CanvasTexture } from 'three';
import { getAllPlanets, filterByTier } from '../../utils/planets';
import { REGION_DOT_COLORS } from '../../utils/constants';
import regionsData from '../../data/regions.json';
import type { Region } from '../../types';

const TEX_SIZE = 2048;
const GRID_UNITS = 21;
const PX_PER_UNIT = TEX_SIZE / GRID_UNITS;
const CENTER_X = 10 * PX_PER_UNIT;
const CENTER_Y = 10.5 * PX_PER_UNIT;

export function createGalaxyPlaneTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0a0912';
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Region rings
  for (const region of (regionsData as Region[]).slice().reverse()) {
    const outerR = region.outerRadius * PX_PER_UNIT;
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, outerR, 0, Math.PI * 2);
    ctx.fillStyle = region.color;
    ctx.fill();
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_UNITS; i++) {
    const p = i * PX_PER_UNIT;
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(TEX_SIZE, p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, TEX_SIZE); ctx.stroke();
  }

  // Planet dots (tier 1 and 2 only)
  const planets = filterByTier(getAllPlanets(), 2);
  for (const planet of planets) {
    const px = planet.trueX * PX_PER_UNIT;
    const py = planet.trueY * PX_PER_UNIT;
    const color = REGION_DOT_COLORS[planet.Region] || 0xaaaaaa;
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const size = planet.tier === 1 ? 6 : 3;

    // Glow
    if (planet.tier === 1) {
      const grad = ctx.createRadialGradient(px, py, 0, px, py, size * 4);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(px - size * 4, py - size * 4, size * 8, size * 8);
    }

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();

    // Label for tier 1
    if (planet.tier === 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(planet.Name, px + size + 4, py + 4);
    }
  }

  const texture = new CanvasTexture(canvas);
  return texture;
}
