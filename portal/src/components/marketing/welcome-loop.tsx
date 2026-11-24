/* WelcomeLoop — hero banner line: "Facial verification that puts privacy
   first." The lead-in animates on a 9s loop (letters materialising one after
   another from small blue balls, holding, then shimmering out and repeating)
   while the closing phrase stays static. Pure CSS, existing tokens only.
   Without motion the whole line rests statically visible; screen readers get
   the full line at once. */

const ANIMATED_TEXT = "Facial verification that ";
const STATIC_TEXT = "puts privacy first.";
const LEAD_COLOR = "rgba(255, 255, 255, 0.85)";
const ACCENT_COLOR = "rgb(var(--glow-ice))";

const ICE = "rgb(var(--glow-ice))";

/* Night-sky glitter: plus-shaped star sparkles with a soft glow plus a few
   tiny round dots. Deliberately star-like so the field reads as part of the
   dark hero — nothing like the round travelling dots used in the light
   sections below. */
const SPARKLES = [
  { left: "1%", top: "12%", size: 12, color: "#ffffff", cls: "glitter-a", delay: "0s", star: true },
  { left: "6%", top: "74%", size: 4, color: ICE, cls: "glitter-b", delay: "0.4s", star: false },
  { left: "12%", top: "2%", size: 9, color: "#ffffff", cls: "glitter-c", delay: "0.9s", star: true },
  { left: "20%", top: "90%", size: 3, color: "#ffffff", cls: "glitter-b", delay: "1.3s", star: false },
  { left: "30%", top: "6%", size: 11, color: ICE, cls: "glitter-a", delay: "0.2s", star: true },
  { left: "42%", top: "94%", size: 3, color: "#ffffff", cls: "glitter-c", delay: "1.7s", star: false },
  { left: "52%", top: "4%", size: 13, color: "#ffffff", cls: "glitter-b", delay: "0.7s", star: true },
  { left: "63%", top: "92%", size: 4, color: ICE, cls: "glitter-a", delay: "1.1s", star: false },
  { left: "74%", top: "8%", size: 10, color: ICE, cls: "glitter-c", delay: "0.5s", star: true },
  { left: "84%", top: "82%", size: 3, color: "#ffffff", cls: "glitter-a", delay: "1.5s", star: false },
  { left: "92%", top: "22%", size: 12, color: ICE, cls: "glitter-b", delay: "0.1s", star: true },
  { left: "97%", top: "62%", size: 3, color: ICE, cls: "glitter-c", delay: "1.9s", star: false },
];

export function WelcomeLoop() {
  const full = `${ANIMATED_TEXT}${STATIC_TEXT}`;
  return (
    <div className="relative" role="img" aria-label={full}>
      {/* Glitter field — glowing star sparkles and tiny dots for the dark hero */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-4">
        {SPARKLES.map((s, k) =>
          s.star ? (
            <span
              key={k}
              className={`absolute ${s.cls}`}
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                opacity: 0,
                animationDelay: s.delay,
              }}
            >
              <span
                className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
                style={{ background: s.color, boxShadow: `0 0 6px 1px ${s.color}` }}
              />
              <span
                className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2"
                style={{ background: s.color, boxShadow: `0 0 6px 1px ${s.color}` }}
              />
            </span>
          ) : (
            <span
              key={k}
              className={`absolute ${s.cls} rounded-full`}
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                background: s.color,
                boxShadow: `0 0 6px 1px ${s.color}`,
                opacity: 0,
                animationDelay: s.delay,
              }}
            />
          ),
        )}
      </div>
      <p className="relative font-display text-[clamp(20px,2.6vw,32px)] font-semibold leading-tight tracking-tight">
        {ANIMATED_TEXT.split("").map((ch, idx) => {
          const delay = `${(idx * 0.03).toFixed(2)}s`;
          return (
            <span
              key={idx}
              aria-hidden="true"
              className="relative inline-block"
              style={{ color: LEAD_COLOR }}
            >
              <span
                aria-hidden="true"
                style={{
                  animationDelay: delay,
                  background: "rgb(var(--glow-blue))",
                }}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 motion-safe:animate-[welcome-ball_9s_ease-out_infinite]"
              />
              <span
                aria-hidden="true"
                style={{ animationDelay: delay }}
                className="inline-block motion-safe:animate-[welcome-letter_9s_ease-in-out_infinite]"
              >
                {ch === " " ? " " : ch}
              </span>
            </span>
          );
        })}
        <span aria-hidden="true" style={{ color: ACCENT_COLOR }}>
          {STATIC_TEXT}
        </span>
      </p>
    </div>
  );
}

/* HeroCloser — the quiet sign-off near the end of the hero: "A safer way to
   say it's you." Letters roll in and back out on a soft 6s loop, no balls,
   no glitter — deliberately dimmer and smaller than the lines above. Static
   for reduced motion. */
const CLOSER_TEXT = "A safer way to say it's you.";

export function HeroCloser() {
  return (
    <p
      aria-label={CLOSER_TEXT}
      className="relative text-center font-display text-[clamp(14px,1.6vw,18px)] font-normal tracking-wide text-white/50 [perspective:600px]"
    >
      {CLOSER_TEXT.split("").map((ch, idx) => (
        <span
          key={idx}
          aria-hidden="true"
          style={{ animationDelay: `${(idx * 0.04).toFixed(2)}s` }}
          className="inline-block motion-safe:animate-[closer-roll_6s_ease-in-out_infinite]"
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </p>
  );
}
