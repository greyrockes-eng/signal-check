'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// react-globe.gl is client-only (uses three.js + WebGL)
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface CountryFeature {
  type: 'Feature';
  properties: {
    ADMIN: string;
    ISO_A2: string;
    ISO_A3: string;
  };
  geometry: any;
}

interface ExploreGlobeProps {
  onCountrySelect: (iso2: string, name: string) => void;
  selectedIso2: string | null;
}

export default function ExploreGlobe({ onCountrySelect, selectedIso2 }: ExploreGlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<{ features: CountryFeature[] }>({ features: [] });
  const [hoverD, setHoverD] = useState<CountryFeature | null>(null);
  const [size, setSize] = useState({ width: 600, height: 600 });

  // Load country polygons (Natural Earth 110m, ~250KB)
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then((r) => r.json())
      .then(setCountries)
      .catch((err) => console.error('Failed to load country polygons:', err));
  }, []);

  // Responsive size
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = Math.min(w, 600);
        setSize({ width: w, height: h });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-rotate when not hovering
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = !hoverD;
        controls.autoRotateSpeed = 0.4;
      }
    }
  }, [hoverD]);

  return (
    <div ref={containerRef} className="w-full">
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="#0c0f1a"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        polygonsData={countries.features.filter((f) => f.properties.ISO_A2 !== '-99')}
        polygonAltitude={(d: any) => {
          if (d === hoverD) return 0.1;
          if (d.properties.ISO_A2.toLowerCase() === selectedIso2) return 0.08;
          return 0.01;
        }}
        polygonCapColor={(d: any) => {
          if (d === hoverD) return 'rgba(59, 130, 246, 0.8)';
          if (d.properties.ISO_A2.toLowerCase() === selectedIso2) return 'rgba(168, 85, 247, 0.7)';
          return 'rgba(255, 255, 255, 0.05)';
        }}
        polygonSideColor={() => 'rgba(0, 100, 200, 0.15)'}
        polygonStrokeColor={() => '#1e2540'}
        polygonLabel={(d: any) => `
          <div style="background:#0c0f1a;border:1px solid #1e2540;padding:6px 10px;border-radius:6px;color:#fff;font-size:12px;font-family:system-ui">
            <div style="font-weight:600">${d.properties.ADMIN}</div>
            <div style="color:#9ca3af;font-size:10px;margin-top:2px">click to load news</div>
          </div>
        `}
        onPolygonHover={(d: any) => setHoverD(d)}
        onPolygonClick={(d: any) => {
          const iso2 = d.properties.ISO_A2.toLowerCase();
          onCountrySelect(iso2, d.properties.ADMIN);
        }}
        polygonsTransitionDuration={300}
      />
    </div>
  );
}
