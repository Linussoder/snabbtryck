"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor } from "@/lib/store";
import {
  EMOJI_CATEGORIES,
  getRecentEmoji,
  pushRecentEmoji,
  searchEmoji,
} from "@/lib/emoji";

export function EmojiTool() {
  const addEmoji = useEditor((s) => s.addEmoji);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(EMOJI_CATEGORIES[0].key);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentEmoji());
  }, []);

  const results = useMemo(() => (q ? searchEmoji(q) : []), [q]);
  const active = EMOJI_CATEGORIES.find((c) => c.key === cat)!;

  function place(c: string) {
    addEmoji(c);
    pushRecentEmoji(c);
    setRecent(getRecentEmoji());
  }

  return (
    <div className="space-y-3">
      <h3 className="eyebrow">Emoji</h3>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Sök — t.ex. padel, eld, krona"
        className="field text-sm"
      />

      {q ? (
        <Grid emojis={results} onPick={place} empty="Inga träffar" />
      ) : (
        <>
          {recent.length > 0 && (
            <div>
              <p className="spec text-[10px] text-muted mb-1.5">Senast använda</p>
              <Grid emojis={recent} onPick={place} />
            </div>
          )}

          <div className="flex flex-wrap gap-1 border-y border-line py-2">
            {EMOJI_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                title={c.label}
                className={`flex h-8 w-8 items-center justify-center rounded-[3px] text-lg transition-colors ${
                  c.key === cat ? "bg-ink" : "hover:bg-paper-2"
                }`}
              >
                {c.icon}
              </button>
            ))}
          </div>

          <div>
            <p className="spec text-[10px] text-muted mb-1.5">{active.label}</p>
            <Grid emojis={active.emojis.map((e) => e.c)} onPick={place} />
          </div>
        </>
      )}
      <p className="spec text-[10px] text-muted">
        Full Unicode-uppsättning, renderad i hög upplösning för tryck.
      </p>
    </div>
  );
}

function Grid({
  emojis,
  onPick,
  empty,
}: {
  emojis: string[];
  onPick: (c: string) => void;
  empty?: string;
}) {
  if (!emojis.length)
    return <p className="spec py-3 text-center text-[11px] text-muted">{empty ?? "—"}</p>;
  return (
    <div className="grid grid-cols-6 gap-1">
      {emojis.map((c, i) => (
        <button
          key={c + i}
          onClick={() => onPick(c)}
          className="flex aspect-square items-center justify-center rounded-[3px] text-2xl transition-transform hover:scale-110 hover:bg-paper-2"
        >
          {c}
        </button>
      ))}
    </div>
  );
}
