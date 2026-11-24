/**
 * Browser side: capture 5 photos to enroll, then 1 photo to verify. Posts to YOUR backend
 * (express-routes.ts), which holds the Imani Vision API key. Never call Imani Vision from the
 * browser with your key.
 *
 *   npm install react-webcam
 */

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

const ENROLMENT_PHOTOS = 5;

async function toBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

async function postForm(url: string, form: FormData): Promise<{ ok: boolean; body: Record<string, unknown> }> {
  const res = await fetch(url, { method: "POST", body: form });
  return { ok: res.ok, body: await res.json().catch(() => ({})) };
}

export function EnrollAndVerify() {
  const webcam = useRef<Webcam>(null);
  const [shots, setShots] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const snap = useCallback(() => webcam.current?.getScreenshot() ?? null, []);

  const capture = () => {
    const shot = snap();
    if (shot && shots.length < ENROLMENT_PHOTOS) setShots([...shots, shot]);
  };

  const enroll = async () => {
    setBusy(true);
    const form = new FormData();
    for (const [i, shot] of shots.entries()) form.append("images", await toBlob(shot), `photo-${i + 1}.jpg`);
    form.append("consent", String(agreed));
    const { ok, body } = await postForm("/api/face/enroll", form);
    setStatus(ok ? "Enrolled." : String(body.message ?? "Enrollment failed"));
    if (ok) setShots([]);
    setBusy(false);
  };

  const verify = async () => {
    const shot = snap();
    if (!shot) return;
    setBusy(true);
    const form = new FormData();
    form.append("image", await toBlob(shot), "selfie.jpg");
    const { ok, body } = await postForm("/api/face/verify", form);
    if (!ok && body.mustReenroll) setStatus("Your face enrollment needs updating. Please enroll again.");
    else setStatus(ok ? (body.match ? "Verified." : "That didn't match. Try again in better light.") : String(body.message));
    setBusy(false);
  };

  return (
    <div>
      <Webcam ref={webcam} audio={false} screenshotFormat="image/jpeg" mirrored
        videoConstraints={{ width: 640, height: 480, facingMode: "user" }} />

      <h3>Enroll ({shots.length}/{ENROLMENT_PHOTOS})</h3>
      <p>Turn your head slightly between photos.</p>
      <button onClick={capture} disabled={busy || shots.length === ENROLMENT_PHOTOS}>Capture photo</button>
      <button onClick={() => setShots([])} disabled={busy || shots.length === 0}>Start over</button>
      <label>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        I agree to [your company] storing a protected template of my face to verify it&apos;s me. I can
        delete it in Settings.
      </label>
      <button onClick={enroll} disabled={busy || !agreed || shots.length !== ENROLMENT_PHOTOS}>Enroll</button>

      <h3>Verify</h3>
      <button onClick={verify} disabled={busy}>Verify it&apos;s me</button>

      {status && <p role="status">{status}</p>}
    </div>
  );
}
