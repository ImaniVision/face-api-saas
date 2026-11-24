/* Animated Face ID style check: dots circle the face, eyes blink,
   then the ring resolves green with a check. Loops on an 8s cycle.
   All motion is motion-safe — static first frame for reduced motion. */
const DOTS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  return { x: 60 + 50 * Math.cos(a), y: 60 + 50 * Math.sin(a) };
});

export function FaceIdScan() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="mx-auto h-36 w-36"
      role="img"
      aria-label="Illustrated face check: dots circle a face, then it verifies"
    >
      {/* Progress ring — draws in signal blue, resolves green */}
      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke="#1E4FFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={276}
        strokeDashoffset={276}
        transform="rotate(-90 60 60)"
        className="motion-safe:animate-[scan-ring_8s_linear_infinite]"
      />

      {/* Orbiting dots */}
      <g
        style={{ transformOrigin: "60px 60px" }}
        className="motion-safe:animate-[spin-slow_10s_linear_infinite,scan-fade_8s_ease-in-out_infinite]"
      >
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="2.6" className="fill-signal" />
        ))}
      </g>

      {/* Face outline */}
      <rect
        x="40"
        y="36"
        width="40"
        height="50"
        rx="20"
        fill="none"
        stroke="#0B1F3A"
        strokeWidth="3"
      />
      {/* Blinking eyes */}
      <ellipse
        cx="52"
        cy="58"
        rx="3.4"
        ry="4.4"
        className="fill-ink motion-safe:animate-[blink_4.5s_ease-in-out_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <ellipse
        cx="68"
        cy="58"
        rx="3.4"
        ry="4.4"
        className="fill-ink motion-safe:animate-[blink_4.5s_ease-in-out_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      {/* Smile */}
      <path
        d="M52 72 Q60 78 68 72"
        fill="none"
        stroke="#0B1F3A"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Verified check — pops in at the end of each cycle */}
      <g
        className="motion-safe:animate-[verified-pop_8s_ease-in-out_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <circle cx="60" cy="60" r="44" fill="#1FAA76" opacity="0.12" />
        <path
          d="M50 61 l7 7 14-15"
          fill="none"
          stroke="#1FAA76"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
