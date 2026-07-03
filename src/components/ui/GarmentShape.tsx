import { GarmentShape as Shape, ViewKey } from "@/lib/garments";
import { GARMENT_PATHS as PATHS } from "@/lib/garmentPaths";

// SVG-plagg i normaliserad 0..100 viewBox. Volym byggs med ljus/skugg-lager
// (vitt highlight uppe, kant- och bottenskugga) + sömmar/krage + kontaktskugga
// så plagget läser som ett riktigt tygplagg, inte en platt ikon.

/** Sömmar, krage och plaggspecifika detaljer, ritade ovanpå skuggningen. */
function details(shape: Shape, view: ViewKey, seam: string) {
  const sw = 0.7;
  switch (shape) {
    case "tshirt":
    case "longsleeve":
      return (
        <>
          {/* krage-rib */}
          <path d="M44,15.8 C46,20.5 54,20.5 56,15.8" fill="none" stroke={seam} strokeWidth={1.1} />
          <path d="M43,17 C46,22.4 54,22.4 57,17" fill="none" stroke={seam} strokeWidth={sw} opacity={0.6} />
          {/* axelsömmar */}
          <path d="M44,16 L34,20.5" fill="none" stroke={seam} strokeWidth={sw} opacity={0.7} />
          <path d="M56,16 L66,20.5" fill="none" stroke={seam} strokeWidth={sw} opacity={0.7} />
          {/* ärm-veck */}
          <path d={shape === "tshirt" ? "M76,44.5 L70,41" : "M82,74 L72,45"} fill="none" stroke={seam} strokeWidth={sw} opacity={0.55} />
          <path d={shape === "tshirt" ? "M24,44.5 L30,41" : "M18,74 L28,45"} fill="none" stroke={seam} strokeWidth={sw} opacity={0.55} />
          {/* nederkant-fåll */}
          <path d="M30,85 L70,85" fill="none" stroke={seam} strokeWidth={sw} opacity={0.4} />
        </>
      );
    case "hoodie":
      return (
        <>
          {/* huva */}
          <path d="M31,24 C36,31 64,31 69,24 C66,16 58,13 50,13 C42,13 34,16 31,24 Z" fill="rgba(0,0,0,0.12)" stroke={seam} strokeWidth={0.8} />
          <path d="M33,25 C38,30 62,30 67,25" fill="none" stroke={seam} strokeWidth={sw} opacity={0.6} />
          {/* dragsko */}
          {view === "front" && <line x1="47" y1="27" x2="47" y2="45" stroke={seam} strokeWidth={sw} opacity={0.7} />}
          {view === "front" && <line x1="53" y1="27" x2="53" y2="45" stroke={seam} strokeWidth={sw} opacity={0.7} />}
          {/* känguruficka */}
          {view === "front" && <path d="M37,60 L63,60 L61,75 L39,75 Z" fill="rgba(0,0,0,0.06)" stroke={seam} strokeWidth={0.8} />}
          {/* mudd nederkant */}
          <path d="M28,84 L72,84" fill="none" stroke={seam} strokeWidth={1} opacity={0.5} />
        </>
      );
    case "jacket":
      return (
        <>
          {/* dragkedja */}
          <line x1="50" y1="20" x2="50" y2="90" stroke={seam} strokeWidth={1} opacity={0.8} />
          <line x1="50" y1="21" x2="50" y2="89" stroke={seam} strokeWidth={0.4} strokeDasharray="1 1.4" opacity={0.7} />
          {[30, 44, 58, 72].map((y) => (
            <circle key={y} cx="50" cy={y} r="0.9" fill={seam} opacity={0.8} />
          ))}
          <path d="M44,16 L34,20.5 M56,16 L66,20.5" fill="none" stroke={seam} strokeWidth={sw} opacity={0.6} />
        </>
      );
    case "tank":
      return (
        <>
          <path d="M45,13.5 C47,17 53,17 55,13.5" fill="none" stroke={seam} strokeWidth={1} />
          <path d="M39,17.5 L41,33 M61,17.5 L59,33" fill="none" stroke={seam} strokeWidth={sw} opacity={0.6} />
          <path d="M38,86 L62,86" fill="none" stroke={seam} strokeWidth={sw} opacity={0.4} />
        </>
      );
    case "cap":
      return (
        <>
          {/* skärm */}
          <ellipse cx="50" cy="60" rx="34" ry="7" fill="rgba(0,0,0,0.16)" stroke={seam} strokeWidth={0.8} />
          {/* panelsömmar */}
          <path d="M50,33 L50,58 M34,37 C40,47 46,55 50,58 M66,37 C60,47 54,55 50,58" fill="none" stroke={seam} strokeWidth={sw} opacity={0.5} />
          <circle cx="50" cy="35" r="1.1" fill={seam} opacity={0.7} />
        </>
      );
    case "bag":
      return (
        <>
          {/* handtag */}
          <path d="M37,35 C37,21 47,21 47,35" fill="none" stroke={seam} strokeWidth={1.6} />
          <path d="M53,35 C53,21 63,21 63,35" fill="none" stroke={seam} strokeWidth={1.6} />
          {/* veck */}
          <path d="M35,45 L37,86 M65,45 L63,86" fill="none" stroke={seam} strokeWidth={sw} opacity={0.4} />
        </>
      );
    default:
      return null;
  }
}

export function GarmentShape({
  shape,
  view,
  color,
  dark,
  className = "",
}: {
  shape: Shape;
  view: ViewKey;
  color: string;
  dark: boolean;
  className?: string;
}) {
  const path = PATHS[shape];
  const stroke = dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.30)";
  const seam = dark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.26)";
  // Deterministiskt id (ingen slump → ingen hydration-mismatch), unikt per instans.
  const uid = `g${shape}-${view}-${color.replace(/[^a-z0-9]/gi, "")}`;

  // Ljusstyrka på lagren beror på om plagget är mörkt eller ljust.
  const hiTop = dark ? 0.14 : 0.34; // topp-highlight
  const shBottom = dark ? 0.34 : 0.16; // botten/drape-skugga
  const shEdge = dark ? 0.28 : 0.14; // kant-rundning

  return (
    <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* topp-ljus (bröstvolym) */}
        <radialGradient id={`${uid}-hi`} cx="0.42" cy="0.28" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity={hiTop} />
          <stop offset="0.55" stopColor="#fff" stopOpacity={hiTop * 0.25} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        {/* kant-rundning vänster/höger */}
        <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={shEdge} />
          <stop offset="0.18" stopColor="#000" stopOpacity="0" />
          <stop offset="0.82" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={shEdge} />
        </linearGradient>
        {/* botten-drape */}
        <linearGradient id={`${uid}-drape`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.62" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={shBottom} />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={path} />
        </clipPath>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id={`${uid}-cast`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {/* kontaktskugga under plagget */}
      <ellipse cx="50" cy="93.5" rx="26" ry="3.2" fill="rgba(0,0,0,0.22)" filter={`url(#${uid}-cast)`} />

      {/* bas-färg */}
      <path d={path} fill={color} stroke={stroke} strokeWidth={1} strokeLinejoin="round" />

      {/* volym-lager, klippta till plaggets form */}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-hi)`} />
        <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-edge)`} />
        <rect x="0" y="0" width="100" height="100" fill={`url(#${uid}-drape)`} />
        {/* mjuka tygveck */}
        <path
          d="M42,52 C44,66 44,74 41,84"
          fill="none"
          stroke="#000"
          strokeOpacity={dark ? 0.22 : 0.09}
          strokeWidth={2.4}
          filter={`url(#${uid}-soft)`}
        />
        <path
          d="M60,50 C58,64 59,74 62,84"
          fill="none"
          stroke="#000"
          strokeOpacity={dark ? 0.2 : 0.08}
          strokeWidth={2.2}
          filter={`url(#${uid}-soft)`}
        />
        <path
          d="M50,40 C51,58 50,72 50,84"
          fill="none"
          stroke="#fff"
          strokeOpacity={dark ? 0.06 : 0.16}
          strokeWidth={2}
          filter={`url(#${uid}-soft)`}
        />
      </g>

      {/* skarp kantlinje ovanpå */}
      <path d={path} fill="none" stroke={stroke} strokeWidth={1} strokeLinejoin="round" />

      {/* sömmar & detaljer */}
      {details(shape, view, seam)}
    </svg>
  );
}
