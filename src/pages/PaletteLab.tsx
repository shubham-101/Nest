import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';

function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}
function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(255 * f(0), 255 * f(8), 255 * f(4));
}
function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrast(a: string, b: string) {
  const l1 = luminance(a), l2 = luminance(b);
  const light = Math.max(l1, l2), dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

export default function PaletteLab() {
  const [base, setBase] = useState('#0f766e');
  const rgb = hexToRgb(base);
  // hsl
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h = d === 0 ? 0 : max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);

  const harmonies = {
    Complementary: [hslToHex(h, s * 100, l * 100), hslToHex((h + 180) % 360, s * 100, l * 100)],
    Analogous: [hslToHex((h - 30 + 360) % 360, s * 100, l * 100), hslToHex(h, s * 100, l * 100), hslToHex((h + 30) % 360, s * 100, l * 100)],
    Triadic: [hslToHex(h, s * 100, l * 100), hslToHex((h + 120) % 360, s * 100, l * 100), hslToHex((h + 240) % 360, s * 100, l * 100)],
    Split: [hslToHex(h, s * 100, l * 100), hslToHex((h + 150) % 360, s * 100, l * 100), hslToHex((h + 210) % 360, s * 100, l * 100)],
    Monochromatic: [hslToHex(h, s * 100, Math.max(10, l * 100 - 30)), hslToHex(h, s * 100, l * 100), hslToHex(h, s * 100, Math.min(90, l * 100 + 30))],
  };

  const shades = Array.from({ length: 9 }, (_, i) => hslToHex(h, s * 100, 10 + i * 10));

  const copy = (hex: string) => navigator.clipboard?.writeText(hex);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Color palette lab</h1>

      <Card>
        <CardContent className="py-5 flex items-center gap-4">
          <input type="color" value={base} onChange={e => setBase(e.target.value)} className="h-12 w-12 rounded-lg border border-border cursor-pointer" />
          <Input value={base} onChange={e => setBase(e.target.value)} className="font-mono" />
          <div className="text-xs text-text-muted">H {Math.round(h)}° · S {Math.round(s * 100)}% · L {Math.round(l * 100)}%</div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {Object.entries(harmonies).map(([name, colors]) => (
          <Card key={name}>
            <CardHeader><CardTitle className="text-base">{name}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {colors.map(c => (
                  <button key={c} onClick={() => copy(c)} className="flex-1 h-16 rounded-xl border border-border relative group" style={{ background: c }}>
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-black/40 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">{c}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Shades</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {shades.map(c => (
              <button key={c} onClick={() => copy(c)} className="flex-1 h-12 rounded-lg" style={{ background: c }} title={c} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Contrast checker</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Foreground</Label>
              <div className="flex gap-2">
                <input type="color" value={base} onChange={e => setBase(e.target.value)} className="h-10 w-10 rounded border border-border" />
                <Input value={base} onChange={e => setBase(e.target.value)} className="font-mono" />
              </div>
            </div>
            <div>
              <Label>Background</Label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#ffffff" className="h-10 w-10 rounded border border-border" id="bg" />
                <Input defaultValue="#ffffff" className="font-mono" id="bgHex" />
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm">
            {(() => {
              const bg = (document.getElementById('bgHex') as HTMLInputElement)?.value || '#ffffff';
              const ratio = contrast(base, bg);
              const aa = ratio >= 4.5, aaa = ratio >= 7;
              return (
                <div className="flex items-center gap-3">
                  <div className="h-12 flex-1 rounded-lg flex items-center justify-center text-lg font-bold" style={{ background: bg, color: base }}>Sample text</div>
                  <div>
                    <div className="font-mono text-lg">{ratio.toFixed(2)}:1</div>
                    <div className="text-xs">AA: {aa ? '✓' : '✗'} · AAA: {aaa ? '✓' : '✗'}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Export</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => {
            const css = `:root {\n  --color-primary: ${base};\n  --color-complement: ${hslToHex((h + 180) % 360, s * 100, l * 100)};\n}`;
            const blob = new Blob([css], { type: 'text/css' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'palette.css'; a.click(); URL.revokeObjectURL(url);
          }}>Download CSS</Button>
        </CardContent>
      </Card>
    </div>
  );
}