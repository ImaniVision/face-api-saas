/**
 * YOUR backend routes, in Express, using imani-client.ts. Your app's own login decides who the
 * user is; Imani Vision only answers "is this the same face as that user's enrollment?".
 *
 *   npm install express multer
 *   npm install -D @types/express @types/multer
 *
 * The browser side is react-enroll-verify.tsx. It posts photos here, never to Imani Vision.
 */

import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { ENROLMENT_PHOTOS, ImaniClient, ImaniError } from "./imani-client";

const imani = new ImaniClient(process.env.IMANI_API_URL ?? "", process.env.IMANI_API_KEY ?? "");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const app = express();

// Replace with your real session lookup. The ID you enroll under is YOUR id for the user.
function currentUserId(req: Request): string {
  const id = req.header("x-demo-user");
  if (!id) throw new ImaniError(401, "Not signed in");
  return id;
}

// Enroll the signed-in user. Your UI must have shown a consent notice and got a yes first.
app.post("/api/face/enroll", upload.array("images", ENROLMENT_PHOTOS), async (req, res, next) => {
  try {
    if (req.body.consent !== "true") {
      res.status(400).json({ message: "Consent is required to enroll a face" });
      return;
    }
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const enrolment = await imani.enroll(
      currentUserId(req),
      files.map((f) => f.buffer),
      { consentReference: "face-enroll-screen-v1" },
    );
    res.json({ enrolledAt: enrolment.consentGrantedAt });
  } catch (err) {
    next(err);
  }
});

// Step-up check before a sensitive action (a large payment, a new payee, ...).
app.post("/api/face/verify", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Send one photo as `image`" });
      return;
    }
    const { match } = await imani.verify(currentUserId(req), req.file.buffer);
    // Decide here, on the server. Never trust a "verified" flag sent by the browser.
    res.json({ match });
  } catch (err) {
    next(err);
  }
});

// Let users delete their face data from your settings page.
app.delete("/api/face", async (req, res, next) => {
  try {
    await imani.delete(currentUserId(req));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (!(err instanceof ImaniError)) {
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
  if (err.retryAfter) res.setHeader("Retry-After", String(err.retryAfter));
  // 400/404/409 messages are about the photos or the enrollment, safe to show the user.
  const userFacing = err.badPhoto || err.notEnrolled || err.mustReenroll || err.status === 401;
  res.status(userFacing ? err.status : 502).json({
    message: userFacing ? err.message : "Face check unavailable, try again",
    mustReenroll: err.mustReenroll,
  });
});

app.listen(4000);
