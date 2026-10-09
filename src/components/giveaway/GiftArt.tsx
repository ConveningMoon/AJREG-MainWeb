"use client";

// Illustrated gift cluster for the giveaway hero: one big rose gift with a gold
// ribbon and bow, two smaller ones behind, sparkles and confetti bits. Pure SVG;
// the cluster floats gently and the sparkles twinkle (CSS, off for reduced motion).

import styles from "./Giveaway.module.css";

const SPARKLE = "M0-10 L2.6-2.6 L10 0 L2.6 2.6 L0 10 L-2.6 2.6 L-10 0 L-2.6-2.6Z";

export function GiftArt({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 260 210" className={styles.gift} role="img" aria-label={label}>
      <defs>
        <linearGradient id="gift-rose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0708b" />
          <stop offset="1" stopColor="#a8405c" />
        </linearGradient>
        <linearGradient id="gift-rose-lid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ee8aa2" />
          <stop offset="1" stopColor="#bf4d68" />
        </linearGradient>
        <linearGradient id="gift-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d79f" />
          <stop offset="1" stopColor="#c7a260" />
        </linearGradient>
        <linearGradient id="gift-peach" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbd5c4" />
          <stop offset="1" stopColor="#f2a791" />
        </linearGradient>
        <linearGradient id="gift-lilac" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9c8f0" />
          <stop offset="1" stopColor="#a98cd6" />
        </linearGradient>
      </defs>

      <ellipse cx="130" cy="192" rx="92" ry="9" fill="#8a2f49" opacity="0.16" />

      {/* small peach gift, left */}
      <g transform="rotate(-8 56 150)">
        <rect x="28" y="124" width="58" height="58" rx="7" fill="url(#gift-peach)" />
        <rect x="24" y="112" width="66" height="18" rx="6" fill="#f6b9a5" />
        <rect x="51" y="112" width="12" height="70" fill="url(#gift-gold)" />
        <path d="M57 112c-16-18-32-8-22 2 7 6 17 3 22-2Zm0 0c16-18 32-8 22 2-7 6-17 3-22-2Z" fill="url(#gift-gold)" />
      </g>

      {/* small lilac gift, right */}
      <g transform="rotate(7 208 150)">
        <rect x="184" y="132" width="52" height="50" rx="7" fill="url(#gift-lilac)" />
        <rect x="180" y="121" width="60" height="17" rx="6" fill="#bda4e0" />
        <rect x="204" y="121" width="12" height="61" fill="#f4c7d1" />
        <path d="M210 121c-15-17-30-7-21 2 7 6 16 3 21-2Zm0 0c15-17 30-7 21 2-7 6-16 3-21-2Z" fill="#f4c7d1" />
      </g>

      {/* main gift */}
      <g className={styles.giftMain}>
        <rect x="82" y="100" width="96" height="86" rx="9" fill="url(#gift-rose)" />
        <rect x="74" y="78" width="112" height="28" rx="8" fill="url(#gift-rose-lid)" />
        <rect x="122" y="78" width="16" height="108" fill="url(#gift-gold)" />
        <rect x="74" y="98" width="112" height="3" fill="#8a2f49" opacity="0.18" />
        <path d="M130 78C104 44 66 62 90 82c13 9 33 1 40-4Z" fill="url(#gift-gold)" />
        <path d="M130 78c26-34 64-16 40 4-13 9-33 1-40-4Z" fill="url(#gift-gold)" />
        <path d="M121 76c-14-16-28-12-24-4" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="130" cy="79" rx="11" ry="9" fill="#e7c98d" />
      </g>

      {/* sparkles */}
      <g fill="#c7a260">
        <path className={styles.twinkle} style={{ animationDelay: "0s" }} transform="translate(62 70) scale(1.1)" d={SPARKLE} />
        <path className={styles.twinkle} style={{ animationDelay: "0.9s" }} transform="translate(222 70)" d={SPARKLE} />
        <path className={styles.twinkle} style={{ animationDelay: "1.6s" }} transform="translate(198 28) scale(0.7)" d={SPARKLE} />
        <path className={styles.twinkle} style={{ animationDelay: "0.4s" }} transform="translate(70 24) scale(0.6)" d={SPARKLE} />
      </g>

      {/* confetti bits */}
      <g>
        <rect x="108" y="20" width="9" height="5" rx="2" fill="#f0a6b6" transform="rotate(25 112 22)" />
        <rect x="152" y="34" width="8" height="5" rx="2" fill="#a98cd6" transform="rotate(-30 156 36)" />
        <circle cx="30" cy="96" r="4" fill="#f6b9a5" />
        <circle cx="236" cy="108" r="4.5" fill="#f0a6b6" />
        <rect x="14" y="140" width="8" height="5" rx="2" fill="#c7a260" transform="rotate(-20 18 142)" />
        <circle cx="168" cy="16" r="3.5" fill="#e7c98d" />
        <rect x="236" y="160" width="9" height="5" rx="2" fill="#a98cd6" transform="rotate(35 240 162)" />
      </g>
    </svg>
  );
}
