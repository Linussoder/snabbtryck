// Emoji-bibliotek för emojiverktyget. Kategoriindelat med svenska sökord.

export interface EmojiCategory {
  key: string;
  label: string;
  icon: string;
  emojis: { c: string; k: string }[]; // char + sökord
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    key: "smileys",
    label: "Smileys",
    icon: "😀",
    emojis: [
      { c: "😀", k: "glad leende" },
      { c: "😂", k: "skratt tårar roligt" },
      { c: "😍", k: "kär hjärtan ögon" },
      { c: "😎", k: "cool solglasögon" },
      { c: "🤩", k: "stjärnögon wow" },
      { c: "😜", k: "tunga blink" },
      { c: "🤔", k: "tänker fundera" },
      { c: "😴", k: "sover trött" },
      { c: "😢", k: "ledsen gråta" },
      { c: "😡", k: "arg ilsken" },
      { c: "🥳", k: "fest party" },
      { c: "😇", k: "ängel snäll" },
      { c: "🤯", k: "exploderar wow" },
      { c: "😱", k: "chock rädd" },
      { c: "🤠", k: "cowboy" },
      { c: "👻", k: "spöke halloween" },
      { c: "💀", k: "dödskalle skull" },
      { c: "🤖", k: "robot" },
      { c: "👽", k: "alien ufo" },
      { c: "💩", k: "bajs poop" },
    ],
  },
  {
    key: "gester",
    label: "Gester",
    icon: "👍",
    emojis: [
      { c: "👍", k: "tumme upp bra" },
      { c: "👎", k: "tumme ner dålig" },
      { c: "👊", k: "knytnäve fist" },
      { c: "✊", k: "näve power" },
      { c: "👏", k: "applåd klappa" },
      { c: "🙌", k: "händer upp hurra" },
      { c: "🤝", k: "handslag deal" },
      { c: "✌️", k: "peace fred" },
      { c: "🫶", k: "hjärta händer kärlek" },
      { c: "💪", k: "muskel stark gym" },
      { c: "🙏", k: "tack be bön" },
      { c: "👌", k: "okej perfekt" },
      { c: "🤞", k: "korsade fingrar lycka" },
      { c: "🖐️", k: "hand stopp" },
    ],
  },
  {
    key: "hjartan",
    label: "Hjärtan",
    icon: "❤️",
    emojis: [
      { c: "❤️", k: "hjärta kärlek röd" },
      { c: "🧡", k: "hjärta orange" },
      { c: "💛", k: "hjärta gul" },
      { c: "💚", k: "hjärta grön" },
      { c: "💙", k: "hjärta blå" },
      { c: "💜", k: "hjärta lila" },
      { c: "🖤", k: "hjärta svart" },
      { c: "🤍", k: "hjärta vit" },
      { c: "💥", k: "smäll pow boom" },
      { c: "🔥", k: "eld fire hett" },
      { c: "⭐", k: "stjärna star" },
      { c: "🌟", k: "glittrande stjärna" },
      { c: "✨", k: "gnistror magi" },
      { c: "⚡", k: "blixt energi" },
      { c: "💫", k: "yr snurr" },
      { c: "💯", k: "hundra perfekt" },
    ],
  },
  {
    key: "sport",
    label: "Sport",
    icon: "🏆",
    emojis: [
      { c: "🎾", k: "tennis padel boll" },
      { c: "⚽", k: "fotboll" },
      { c: "🏀", k: "basket" },
      { c: "🏐", k: "volleyboll" },
      { c: "🏈", k: "amerikansk fotboll" },
      { c: "⚾", k: "baseboll" },
      { c: "🏒", k: "hockey" },
      { c: "🏓", k: "pingis bordtennis" },
      { c: "🏸", k: "badminton" },
      { c: "🥊", k: "boxning" },
      { c: "🏆", k: "pokal vinnare trofé" },
      { c: "🥇", k: "guld medalj etta" },
      { c: "🥈", k: "silver medalj" },
      { c: "🥉", k: "brons medalj" },
      { c: "🎯", k: "prick mål bullseye" },
      { c: "🚴", k: "cykel" },
      { c: "🏃", k: "löpning springa" },
      { c: "🏋️", k: "gym styrka" },
      { c: "⛳", k: "golf" },
      { c: "🎽", k: "löparlinne" },
    ],
  },
  {
    key: "djur",
    label: "Djur",
    icon: "🐶",
    emojis: [
      { c: "🐶", k: "hund" },
      { c: "🐱", k: "katt" },
      { c: "🦊", k: "räv" },
      { c: "🐻", k: "björn" },
      { c: "🐼", k: "panda" },
      { c: "🦁", k: "lejon" },
      { c: "🐯", k: "tiger" },
      { c: "🐸", k: "groda" },
      { c: "🐵", k: "apa" },
      { c: "🦄", k: "enhörning unicorn" },
      { c: "🐺", k: "varg" },
      { c: "🦅", k: "örn fågel" },
      { c: "🦈", k: "haj" },
      { c: "🐬", k: "delfin" },
      { c: "🐝", k: "bi" },
      { c: "🦋", k: "fjäril" },
      { c: "🐉", k: "drake dragon" },
      { c: "🦖", k: "dinosaurie" },
    ],
  },
  {
    key: "mat",
    label: "Mat",
    icon: "🍕",
    emojis: [
      { c: "🍕", k: "pizza" },
      { c: "🍔", k: "hamburgare" },
      { c: "🌭", k: "korv hotdog" },
      { c: "🍟", k: "pommes" },
      { c: "🌮", k: "taco" },
      { c: "🍣", k: "sushi" },
      { c: "🍩", k: "munk donut" },
      { c: "🍦", k: "glass" },
      { c: "🍺", k: "öl" },
      { c: "🍹", k: "drink cocktail" },
      { c: "☕", k: "kaffe" },
      { c: "🥑", k: "avokado" },
      { c: "🍎", k: "äpple frukt" },
      { c: "🍌", k: "banan" },
      { c: "🍓", k: "jordgubbe" },
      { c: "🌶️", k: "chili stark" },
    ],
  },
  {
    key: "resa",
    label: "Resa",
    icon: "🚀",
    emojis: [
      { c: "🚀", k: "raket rymd" },
      { c: "✈️", k: "flygplan" },
      { c: "🚗", k: "bil" },
      { c: "🏍️", k: "motorcykel" },
      { c: "🚲", k: "cykel" },
      { c: "⛵", k: "segelbåt" },
      { c: "🗺️", k: "karta" },
      { c: "🏔️", k: "berg" },
      { c: "🏝️", k: "ö strand" },
      { c: "🌊", k: "våg hav" },
      { c: "🌍", k: "jordklot värld" },
      { c: "🌙", k: "måne natt" },
      { c: "☀️", k: "sol" },
      { c: "🌈", k: "regnbåge" },
      { c: "🏕️", k: "camping tält" },
      { c: "🎪", k: "cirkus tält" },
    ],
  },
  {
    key: "symboler",
    label: "Symboler",
    icon: "⚠️",
    emojis: [
      { c: "👑", k: "krona kung drottning" },
      { c: "💎", k: "diamant juvel" },
      { c: "🎸", k: "gitarr musik" },
      { c: "🎧", k: "hörlurar musik" },
      { c: "🎵", k: "not musik" },
      { c: "📸", k: "kamera foto" },
      { c: "🎮", k: "gaming spel" },
      { c: "💡", k: "idé lampa" },
      { c: "🔧", k: "verktyg skiftnyckel" },
      { c: "⚙️", k: "kugghjul" },
      { c: "🚩", k: "flagga" },
      { c: "⚠️", k: "varning" },
      { c: "☮️", k: "fred peace" },
      { c: "♻️", k: "återvinning" },
      { c: "❌", k: "kryss nej" },
      { c: "✅", k: "check ja" },
      { c: "🆒", k: "cool" },
      { c: "🅱️", k: "b" },
    ],
  },
];

const RECENT_KEY = "tryck_recent_emoji";

export function getRecentEmoji(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function pushRecentEmoji(c: string) {
  if (typeof window === "undefined") return;
  const cur = getRecentEmoji().filter((e) => e !== c);
  cur.unshift(c);
  localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, 16)));
}

export function searchEmoji(q: string): string[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const out: string[] = [];
  for (const cat of EMOJI_CATEGORIES) {
    for (const e of cat.emojis) {
      if (e.k.includes(query) || cat.label.toLowerCase().includes(query))
        out.push(e.c);
    }
  }
  return Array.from(new Set(out));
}
