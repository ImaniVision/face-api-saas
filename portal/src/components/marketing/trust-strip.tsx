/* Trust strip — Capture → Protect → Verify. Sits on plain white between the
   hero and the feature cards (no panel background). Each step loops a tiny
   scene: the captured face blinks, the face bursts into a scatter of blue
   template pixels that resolve into a lock, and the check rests green.
   Pure CSS/SVG, motion-safe throughout — reduced motion shows the resting
   first frame of each scene. */

const BURST_DOTS = [
  { x: 24, y: 24, r: 2.2 },
  { x: 18, y: 20, r: 1.6 },
  { x: 30, y: 20, r: 1.6 },
  { x: 20, y: 28, r: 1.6 },
  { x: 28, y: 28, r: 1.6 },
  { x: 13, y: 24, r: 1.8 },
  { x: 35, y: 24, r: 1.8 },
  { x: 24, y: 13, r: 1.8 },
  { x: 24, y: 35, r: 1.8 },
  { x: 16, y: 14, r: 1.4 },
  { x: 32, y: 14, r: 1.4 },
  { x: 16, y: 34, r: 1.4 },
  { x: 32, y: 34, r: 1.4 },
  { x: 10, y: 18, r: 1.4 },
  { x: 38, y: 30, r: 1.4 },
  { x: 24, y: 7, r: 1.4 },
];

function CaptureFace() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-12 w-12 shrink-0"
      role="img"
      aria-label="A captured face, eyes blinking"
    >
      <rect
        x="13"
        y="7"
        width="22"
        height="31"
        rx="11"
        fill="none"
        stroke="#0B1F3A"
        strokeWidth="2.5"
      />
      <ellipse
        cx="20"
        cy="21"
        rx="2.2"
        ry="2.8"
        className="fill-ink motion-safe:animate-[blink_4.5s_ease-in-out_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <ellipse
        cx="28"
        cy="21"
        rx="2.2"
        ry="2.8"
        className="fill-ink motion-safe:animate-[blink_4.5s_ease-in-out_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <path
        d="M20 29.5 Q24 33 28 29.5"
        fill="none"
        stroke="#0B1F3A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProtectBurst() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-12 w-12 shrink-0"
      role="img"
      aria-label="A face scattering into blue pixels that become a lock"
    >
      {/* Phase 1 — the face */}
      <g className="motion-safe:animate-[protect-a_9s_ease-in-out_infinite]">
        <rect
          x="13"
          y="7"
          width="22"
          height="31"
          rx="11"
          fill="none"
          stroke="#0B1F3A"
          strokeWidth="2.5"
        />
        <circle cx="20" cy="21" r="2.2" className="fill-ink" />
        <circle cx="28" cy="21" r="2.2" className="fill-ink" />
        <path
          d="M20 29.5 Q24 33 28 29.5"
          fill="none"
          stroke="#0B1F3A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      {/* Phase 2 — burst of tiny blue template pixels */}
      <g className="motion-safe:animate-[protect-b_9s_ease-in-out_infinite]" opacity="0">
        <g
          className="motion-safe:animate-[spin-slow_14s_linear_infinite]"
          style={{ transformOrigin: "24px 24px" }}
        >
          {BURST_DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} className="fill-signal" />
          ))}
        </g>
      </g>
      {/* Phase 3 — the lock */}
      <g className="motion-safe:animate-[protect-c_9s_ease-in-out_infinite]" opacity="0">
        <path
          d="M18.5 22v-4a5.5 5.5 0 0 1 11 0v4"
          fill="none"
          strokeWidth="3.5"
          className="stroke-amber"
        />
        <rect x="14.5" y="21" width="19" height="16" rx="4" className="fill-amber" />
        <circle cx="24" cy="27" r="2.4" fill="#fff" />
        <rect x="23" y="27.5" width="2" height="4.5" rx="1" fill="#fff" />
      </g>
    </svg>
  );
}

function VerifyCheck() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-12 w-12 shrink-0"
      role="img"
      aria-label="Green check mark"
    >
      <g
        className="motion-safe:animate-[badge-pop_8s_ease-in-out_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <circle cx="24" cy="24" r="16.5" fill="none" stroke="#1FAA76" strokeWidth="3" />
        <path
          d="M17 24.5l5 5 9-11"
          fill="none"
          stroke="#1FAA76"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function Connector({ dot }: { dot: "bg-signal" | "bg-verified" }) {
  return (
    <div className="relative mx-3 h-px min-w-6 flex-1 bg-ink/10 sm:mx-5" aria-hidden="true">
      <span
        className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full motion-safe:animate-[flow-travel_2.4s_linear_infinite] ${dot}`}
      />
    </div>
  );
}

export function TrustStrip() {
  return (
    <section className="bg-white" aria-label="How it works: capture, protect, verify">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="flex items-center">
          <div className="flex min-w-0 items-center gap-3">
            <CaptureFace />
            <div>
              <p className="text-sm font-semibold text-ink">Capture</p>
              <p className="font-mono text-xs text-ink/60">a face</p>
            </div>
          </div>
          <Connector dot="bg-signal" />
          <div className="flex min-w-0 items-center gap-3">
            <ProtectBurst />
            <div>
              <p className="text-sm font-semibold text-ink">Protect</p>
              <p className="font-mono text-xs text-ink/60">one-way transform</p>
            </div>
          </div>
          <Connector dot="bg-verified" />
          <div className="flex min-w-0 items-center gap-3">
            <VerifyCheck />
            <div>
              <p className="text-sm font-semibold text-ink">Verify</p>
              <p className="font-mono text-xs text-ink/60">no image kept</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
