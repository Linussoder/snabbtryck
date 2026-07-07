"use client";

import { useEffect } from "react";
import { DesignElement } from "@/lib/store";
import { fontByName } from "@/lib/fonts";
import { textLines, CHAR_W } from "@/lib/text";
import { ensureCustomFont } from "@/lib/customfont";

// Renderar elementets visuella innehåll, fyller sitt wrapper (100% × 100%).
export function ElementVisual({ el }: { el: DesignElement }) {
  // Registrera ev. eget typsnitt så SVG-texten kan använda det.
  const customFont = el.type === "text" ? el.customFont : undefined;
  const fontData = el.type === "text" ? el.fontData : undefined;
  useEffect(() => {
    if (customFont && fontData) ensureCustomFont(customFont, fontData);
  }, [customFont, fontData]);

  if (el.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={el.src}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full select-none object-contain"
      />
    );
  }

  if (el.type === "emoji") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <text
          x="50"
          y="52"
          fontSize="86"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {el.char}
        </text>
      </svg>
    );
  }

  // text
  const family = el.customFont ?? `${fontByName(el.font).family}, sans-serif`;
  const lines = textLines(el.text);
  const longest = Math.max(1, ...lines.map((l) => l.length || 1));
  const fontSize = 100 / (longest * CHAR_W);
  const boxH = lines.length * fontSize * el.lineHeight;
  const strokeW = el.strokeW > 0 ? (el.strokeW / 100) * fontSize : 0;
  const shadowId = `sh-${el.id}`;
  const shadowFilter = el.shadow ? `url(#${shadowId})` : undefined;
  const shadowDefs = el.shadow ? (
    <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx={fontSize * 0.05} dy={fontSize * 0.05} stdDeviation={fontSize * 0.03} floodColor="rgba(0,0,0,0.55)" />
    </filter>
  ) : null;

  if (el.curve !== 0 && lines.length >= 1) {
    const bulge = (el.curve / 100) * 44;
    const midY = boxH / 2;
    const pathId = `arc-${el.id}`;
    // bågen: vänster → topp/botten → höger
    const d = `M 4 ${midY + bulge / 2} Q 50 ${midY - bulge / 1.5} 96 ${
      midY + bulge / 2
    }`;
    return (
      <svg
        viewBox={`0 0 100 ${boxH}`}
        className="h-full w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <path id={pathId} d={d} fill="none" />
          {shadowDefs}
        </defs>
        <text
          fontFamily={family}
          fontWeight={700}
          fontSize={fontSize}
          fill={el.color}
          stroke={strokeW ? el.stroke : undefined}
          strokeWidth={strokeW || undefined}
          paintOrder="stroke"
          filter={shadowFilter}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {lines[0]}
          </textPath>
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 100 ${boxH}`}
      className="h-full w-full overflow-visible"
      preserveAspectRatio="xMidYMid meet"
    >
      {shadowDefs && <defs>{shadowDefs}</defs>}
      <text
        x="50"
        y={boxH / 2}
        fontFamily={family}
        fontWeight={700}
        fontSize={fontSize}
        fill={el.color}
        stroke={strokeW ? el.stroke : undefined}
        strokeWidth={strokeW || undefined}
        paintOrder="stroke"
        textAnchor="middle"
        dominantBaseline="central"
        filter={shadowFilter}
      >
        {lines.map((l, i) => (
          <tspan
            key={i}
            x="50"
            dy={i === 0 ? -((lines.length - 1) * fontSize * el.lineHeight) / 2 : fontSize * el.lineHeight}
          >
            {l || " "}
          </tspan>
        ))}
      </text>
    </svg>
  );
}
