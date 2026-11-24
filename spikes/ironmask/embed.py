"""
Embed LFW (identities with >= 2 images) with the production model (buffalo_l / ArcFace).
Writes data/embeddings.npz. THROWAWAY SPIKE CODE.

Two embeddings per image:
  bgr - what InsightFace expects (correct)
  rgb - what app/engine.py currently feeds it (cvtColor BGR->RGB before face_analyzer.get)
so the spike also measures what that channel swap costs.

The production MediaPipe "exactly one face" gate is skipped: LFW photos often contain
background faces, so the face nearest the image centre is used instead.
"""

import os
import time
from pathlib import Path

import cv2
import numpy as np
from insightface.app import FaceAnalysis

DATA = "/spike/data"
# Face-detector input size. 640 = the original benchmark; DET_SIZE=320 writes embeddings_det320.npz.
DET_SIZE = int(os.environ.get("DET_SIZE", "640"))
EMBEDDINGS_FILE = "embeddings.npz" if DET_SIZE == 640 else f"embeddings_det{DET_SIZE}.npz"
LFW = Path(DATA) / "lfw_home" / "lfw_funneled"  # sklearn's download; read lazily (all at once is ~7 GB)

people = sorted(d for d in LFW.iterdir() if d.is_dir() and len(list(d.glob("*.jpg"))) >= 2)
paths, labels = [], []
for label, d in enumerate(people):
    for p in sorted(d.glob("*.jpg")):
        paths.append(p)
        labels.append(label)
labels = np.array(labels)
print(f"{len(paths)} images, {len(people)} identities")

fa = FaceAnalysis(
    name="buffalo_l", allowed_modules=["detection", "recognition"], providers=["CPUExecutionProvider"]
)
fa.prepare(ctx_id=0, det_size=(DET_SIZE, DET_SIZE))
rec = fa.models["recognition"]


def unit(v: np.ndarray) -> np.ndarray:
    return v / np.linalg.norm(v)


keep, emb_bgr, emb_rgb = [], [], []
start = time.time()
for i, path in enumerate(paths):
    bgr = cv2.imread(str(path))
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    faces = fa.get(bgr)
    if faces:
        h, w = bgr.shape[:2]
        face = min(
            faces,
            key=lambda f: ((f.bbox[0] + f.bbox[2]) / 2 - w / 2) ** 2 + ((f.bbox[1] + f.bbox[3]) / 2 - h / 2) ** 2,
        )
        emb_bgr.append(unit(face.embedding.copy()))
        if DET_SIZE == 640:  # the RGB comparison was only ever needed once
            rec.get(rgb, face)  # same landmarks, channel-swapped pixels
            emb_rgb.append(unit(face.embedding.copy()))
        keep.append(i)
    if i % 500 == 0:
        print(f"{i}/{len(paths)}  {time.time() - start:.0f}s", flush=True)

print(f"embedded {len(keep)}/{len(paths)} (no face found in {len(paths) - len(keep)})")
np.savez(
    f"{DATA}/{EMBEDDINGS_FILE}",
    labels=labels[keep],
    emb_bgr=np.array(emb_bgr, dtype=np.float32),
    emb_rgb=np.array(emb_rgb or emb_bgr, dtype=np.float32),
    n_total=len(paths),
)
