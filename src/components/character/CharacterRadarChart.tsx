import React from 'react';
import { CharacterSheet } from '../../types';

interface CharacterRadarChartProps {
  character: CharacterSheet;
  size?: number;
}

export const CharacterRadarChart: React.FC<CharacterRadarChartProps> = ({
  character,
  size = 280,
}) => {
  const attrs = character.attributes;

  // Values normalized to 0 - 1
  const str = (attrs.strength?.value || 70) / 100;
  const int = (attrs.intellect?.value || 90) / 100;
  const vit = (attrs.vitality?.value || 68) / 100;
  const dis = (attrs.discipline?.value || 84) / 100;
  const cha = (attrs.charisma?.value || 55) / 100;

  // Center (100, 100), radius 75
  const cx = 100;
  const cy = 100;
  const maxRadius = 75;

  // Calculate coordinates for pentagon points at angles:
  // Angle 1: -90° (STR - Top)
  // Angle 2: -18° (INT - Top Right)
  // Angle 3: 54° (VIT - Bottom Right)
  // Angle 4: 126° (DIS - Bottom Left)
  // Angle 5: 198° (CHA - Top Left)
  const getCoords = (val: number, angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = val * maxRadius;
    const x = cx + r * Math.cos(angleRad);
    const y = cy + r * Math.sin(angleRad);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  };

  const pStr = getCoords(str, -90);
  const pInt = getCoords(int, -18);
  const pVit = getCoords(vit, 54);
  const pDis = getCoords(dis, 126);
  const pCha = getCoords(cha, 198);

  const polygonPoints = `${pStr.x},${pStr.y} ${pInt.x},${pInt.y} ${pVit.x},${pVit.y} ${pDis.x},${pDis.y} ${pCha.x},${pCha.y}`;

  // Rings at 25%, 50%, 75%, 100%
  const makeRing = (pct: number) => {
    const r1 = getCoords(pct, -90);
    const r2 = getCoords(pct, -18);
    const r3 = getCoords(pct, 54);
    const r4 = getCoords(pct, 126);
    const r5 = getCoords(pct, 198);
    return `${r1.x},${r1.y} ${r2.x},${r2.y} ${r3.x},${r3.y} ${r4.x},${r4.y} ${r5.x},${r5.y}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-card">
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-outline">
          Attribute Radar
        </span>
        <span className="text-xs font-bold text-primary tabular-nums">
          Score: {Math.round((str + int + vit + dis + cha) * 20)}
        </span>
      </div>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full overflow-visible select-none"
        >
          {/*  */}
          <polygon points={makeRing(1)} fill="none" stroke="#e2e7ff" strokeWidth="1.5" />
          <polygon points={makeRing(0.75)} fill="none" stroke="#eaedff" strokeWidth="1" strokeDasharray="3 3" />
          <polygon points={makeRing(0.5)} fill="none" stroke="#eaedff" strokeWidth="1" strokeDasharray="3 3" />
          <polygon points={makeRing(0.25)} fill="none" stroke="#eaedff" strokeWidth="1" strokeDasharray="3 3" />

          {/*  */}
          <line x1={cx} y1={cy} x2={cx} y2={cy - maxRadius} stroke="#dae2fd" strokeWidth="1.5" />
          <line x1={cx} y1={cy} x2={cx + maxRadius * Math.cos((-18 * Math.PI) / 180)} y2={cy + maxRadius * Math.sin((-18 * Math.PI) / 180)} stroke="#dae2fd" strokeWidth="1.5" />
          <line x1={cx} y1={cy} x2={cx + maxRadius * Math.cos((54 * Math.PI) / 180)} y2={cy + maxRadius * Math.sin((54 * Math.PI) / 180)} stroke="#dae2fd" strokeWidth="1.5" />
          <line x1={cx} y1={cy} x2={cx + maxRadius * Math.cos((126 * Math.PI) / 180)} y2={cy + maxRadius * Math.sin((126 * Math.PI) / 180)} stroke="#dae2fd" strokeWidth="1.5" />
          <line x1={cx} y1={cy} x2={cx + maxRadius * Math.cos((198 * Math.PI) / 180)} y2={cy + maxRadius * Math.sin((198 * Math.PI) / 180)} stroke="#dae2fd" strokeWidth="1.5" />

          {/*  */}
          <polygon
            points={polygonPoints}
            className="text-primary/20 fill-current"
            stroke="#4f46e5"
            strokeWidth="2.5"
          />

          {/*  */}
          <circle cx={pStr.x} cy={pStr.y} r="4" fill="#4f46e5" className="filter drop-shadow" />
          <circle cx={pInt.x} cy={pInt.y} r="4" fill="#4f46e5" className="filter drop-shadow" />
          <circle cx={pVit.x} cy={pVit.y} r="4" fill="#4f46e5" className="filter drop-shadow" />
          <circle cx={pDis.x} cy={pDis.y} r="4" fill="#4f46e5" className="filter drop-shadow" />
          <circle cx={pCha.x} cy={pCha.y} r="4" fill="#4f46e5" className="filter drop-shadow" />

          {/*  */}
          <text x="100" y="12" textAnchor="middle" className="text-[10px] font-bold fill-amber-700">
            STR {attrs.strength?.value}
          </text>
          <text x="188" y="80" textAnchor="start" className="text-[10px] font-bold fill-violet-700">
            INT {attrs.intellect?.value}
          </text>
          <text x="156" y="185" textAnchor="middle" className="text-[10px] font-bold fill-sky-700">
            VIT {attrs.vitality?.value}
          </text>
          <text x="44" y="185" textAnchor="middle" className="text-[10px] font-bold fill-emerald-700">
            DIS {attrs.discipline?.value}
          </text>
          <text x="12" y="80" textAnchor="end" className="text-[10px] font-bold fill-rose-700">
            CHA {attrs.charisma?.value}
          </text>
        </svg>
      </div>

      {/*  */}
      <div className="w-full mt-4 p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between text-xs">
        <span className="text-on-surface-variant font-medium">Dominant Synergy</span>
        <span className="font-bold text-primary">
          Intellect & Discipline ({Math.round(((int + dis) / 2) * 100)}%)
        </span>
      </div>
    </div>
  );
};
