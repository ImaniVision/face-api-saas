/* §3.1 animated hero background — drifting colour blobs plus two slow
   waves rolling along the bottom. Text sits on plain navy; blobs are
   motion-safe and freeze under prefers-reduced-motion, while the waves
   always stay in motion. */
const WAVE_PATH =
  "M0 96 Q120 64 240 96 T480 96 T720 96 T960 96 T1200 96 T1440 96 T1680 96 T1920 96 T2160 96 T2400 96 T2640 96 T2880 96 V160 H0 Z";

export function HeroBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="hero-blob animate-drift-a absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--glow-blue) / 1) 0%, transparent 65%)" }}
      />
      <div
        className="hero-blob animate-drift-b absolute top-10 right-[-10rem] h-[30rem] w-[30rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--glow-amber) / 1) 0%, transparent 65%)" }}
      />
      <div
        className="hero-blob animate-drift-c absolute bottom-[-12rem] left-1/3 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--glow-ice) / 1) 0%, transparent 65%)" }}
      />
      <div
        className="hero-blob animate-drift-b absolute top-1/3 left-[8%] h-[16rem] w-[16rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--glow-amber) / 1) 0%, transparent 65%)" }}
      />

      {/* Back wave — slow, always in motion */}
      <svg
        className="absolute bottom-0 left-0 h-36 w-[200%] animate-[wave-drift_30s_linear_infinite]"
        viewBox="0 0 2880 160"
        preserveAspectRatio="none"
      >
        <path d={WAVE_PATH} fill="rgba(30,79,255,0.20)" />
      </svg>
      {/* Front wave — faster, opposite direction, always in motion */}
      <svg
        className="absolute bottom-0 left-0 h-28 w-[200%] animate-[wave-drift_20s_linear_infinite_reverse]"
        viewBox="0 0 2880 160"
        preserveAspectRatio="none"
      >
        <path d={WAVE_PATH} fill="rgba(255,255,255,0.06)" />
      </svg>
    </div>
  );
}
