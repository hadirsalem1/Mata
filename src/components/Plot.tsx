import { parse } from 'mathjs';
import React, { useMemo, useRef, useState, useEffect } from 'react';

interface PlotProps {
  fStr: string;
  a: number;
  b: number;
  cPoints: number[];
  m: number;
  f_a: number;
  f_b: number;
}

export const MVTPlot: React.FC<PlotProps> = ({ fStr, a, b, cPoints, m, f_a, f_b }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const height = 400; // Fixed height for simpler aspect ratio keeping
  const padding = 40;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const pathData = useMemo(() => {
    let fNode;
    try {
      fNode = parse(fStr);
    } catch {
      return null;
    }

    // Determine scale bounds
    const dx = Math.abs(b - a);
    const minX = a - dx * 0.3;
    const maxX = b + dx * 0.3;

    let points: { x: number; y: number }[] = [];
    const steps = 300;
    
    let localMinY = Infinity;
    let localMaxY = -Infinity;

    for (let i = 0; i <= steps; i++) {
        const x = minX + (maxX - minX) * (i / steps);
        try {
            const y = fNode.evaluate({ x });
            if (typeof y === 'number' && isFinite(y)) {
                points.push({ x, y });
                if (y < localMinY) localMinY = y;
                if (y > localMaxY) localMaxY = y;
            }
        } catch {
            // Ignore points that can't be evaluated
        }
    }

    // Add tangent points and [a,b] to min/max y just in case
    localMinY = Math.min(localMinY, f_a, f_b);
    localMaxY = Math.max(localMaxY, f_a, f_b);

    // Padding for Y
    const dy = Math.abs(localMaxY - localMinY) || 1;
    let minY = localMinY - dy * 0.2;
    let maxY = localMaxY + dy * 0.2;

    // Ensure 0 is in view if possible without squishing too much
    if (minY > 0 && minY < dy * 0.5) minY = -dy * 0.1;
    if (maxY < 0 && maxY > -dy * 0.5) maxY = dy * 0.1;

    const mapX = (x: number) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding);
    const mapY = (y: number) => height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding);

    // Generate curve path
    const mainCurve = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x)} ${mapY(p.y)}`).join(' ');

    // Axes
    const y0 = mapY(0);
    const x0 = mapX(0);
    
    const xAxis = `M ${padding} ${y0} L ${width - padding} ${y0}`;
    const yAxis = `M ${x0} ${padding} L ${x0} ${height - padding}`;

    // Secant line
    const secantPath = `M ${mapX(a)} ${mapY(f_a)} L ${mapX(b)} ${mapY(f_b)}`;

    // Calculate tangent lines. A tangent at c is y - f(c) = m * (x - c) => y = m(x-c) + f(c)
    // We'll draw it covering the entire X width
    const tangents = cPoints.map(c => {
      try {
          const f_c = fNode.evaluate({ x: c }) as number;
          const y1 = m * (minX - c) + f_c;
          const y2 = m * (maxX - c) + f_c;
          return {
             c, f_c,
             path: `M ${mapX(minX)} ${mapY(y1)} L ${mapX(maxX)} ${mapY(y2)}`
          };
      } catch {
          return null;
      }
    }).filter(t => t !== null);

    return {
       mainCurve,
       xAxis: (minY <= 0 && maxY >= 0) ? xAxis : null,
       yAxis: (minX <= 0 && maxX >= 0) ? yAxis : null,
       secantPath,
       tangents,
       mapX,
       mapY
    };

  }, [fStr, a, b, cPoints, m, width, height, f_a, f_b]);

  if (!pathData) return <div className="p-4 text-gray-500 bg-gray-50 rounded backdrop-blur">Cannot plot function</div>;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] relative text-slate-200">
       <svg width={width} height={height} className="absolute inset-0">
         {/* Axes */}
         {pathData.xAxis && <path d={pathData.xAxis} stroke="currentColor" strokeWidth="1" />}
         {pathData.yAxis && <path d={pathData.yAxis} stroke="currentColor" strokeWidth="1" />}
         
         {/* Main Function Curve */}
         <path d={pathData.mainCurve} fill="none" stroke="#3b82f6" strokeWidth="2" />
         
         {/* Area under interval boundaries just as markers */}
         <line x1={pathData.mapX(a)} y1={height} x2={pathData.mapX(a)} y2={0} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4" />
         <line x1={pathData.mapX(b)} y1={height} x2={pathData.mapX(b)} y2={0} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4" />
         <rect x={pathData.mapX(a)} y={0} width={Math.max(0, pathData.mapX(b) - pathData.mapX(a))} height={height} fill="#f43f5e" fillOpacity="0.05" />
         
         {/* Secant Line (f(a) to f(b)) */}
         <path d={pathData.secantPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5" />
         <circle cx={pathData.mapX(a)} cy={pathData.mapY(f_a)} r="4" fill="#3b82f6" />
         <circle cx={pathData.mapX(b)} cy={pathData.mapY(f_b)} r="4" fill="#3b82f6" />

         {/* Tangents */}
         {pathData.tangents.map((t, idx) => t ? (
            <g key={idx}>
                <path d={t.path} fill="none" stroke="#8b5cf6" strokeWidth="2" />
                <circle cx={pathData.mapX(t.c)} cy={pathData.mapY(t.f_c)} r="4" fill="#8b5cf6" />
                <text x={pathData.mapX(t.c) - 10} y={pathData.mapY(t.f_c) - 15} fill="#8b5cf6" fontSize="12" fontFamily="monospace">c</text>
            </g>
         ) : null)}

         {/* Labels */}
         <text x={pathData.mapX(a) + 5} y={height - 15} fill="#f43f5e" fontSize="10" fontFamily="monospace">a</text>
         <text x={pathData.mapX(b) + 5} y={height - 15} fill="#f43f5e" fontSize="10" fontFamily="monospace">b</text>
       </svg>
    </div>
  );
};
