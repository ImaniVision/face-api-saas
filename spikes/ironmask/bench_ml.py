"""
fp32 vs int8 verification latency at the ML service (HTTP /verify, inside the face-api container).
THROWAWAY BENCHMARK. Paired: one enrolment, one secret codeword, one P, stored both ways, so the two
formats differ only in how P is encoded and how many bytes travel per request (1 MiB vs 257 KiB).
Requests alternate fp32/int8 (and which goes first alternates), so drift hits both equally.

  docker exec -i -e N=400 face-api python - < spikes/ironmask/bench_ml.py   (photos in /tmp/bench)
"""

import base64
import glob
import json
import os
import time
import urllib.request
import uuid

import numpy as np

from app.protection import FP32, INT8, decode_helper, encode_helper

KEY = os.environ["ML_SERVICE_API_KEY"]
N = int(os.environ.get("N", "400"))
WARMUP = 20
ENROL = [f"/tmp/bench/Abdullah_Gul_{n:04d}.jpg" for n in (1, 2, 4, 5, 7)]
PROBES = [open(f"/tmp/bench/Abdullah_Gul_{n:04d}.jpg", "rb").read() for n in (12, 13, 14, 15, 17, 18, 19)]


def post(path, files, fields=()):
    b = uuid.uuid4().hex
    body = b""
    for name, fname, data, ctype in files:
        body += (f'--{b}\r\nContent-Disposition: form-data; name="{name}"; filename="{fname}"\r\n'
                 f"Content-Type: {ctype}\r\n\r\n").encode() + data + b"\r\n"
    for name, value in fields:
        body += f'--{b}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
    body += f"--{b}--\r\n".encode()
    req = urllib.request.Request("http://localhost:8000" + path, data=body, method="POST",
                                 headers={"Content-Type": f"multipart/form-data; boundary={b}", "X-ML-Service-Key": KEY})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


t = post("/enroll", [("files", os.path.basename(p), open(p, "rb").read(), "image/jpeg") for p in ENROL])
assert t["version"] == FP32
fp32 = base64.b64decode(t["helper"])
templates = {"fp32": (fp32, FP32), "int8": (encode_helper(decode_helper(fp32, FP32), INT8), INT8)}
print(json.dumps({k: len(v[0]) for k, v in templates.items()}), flush=True)


def verify(fmt, probe):
    helper, version = templates[fmt]
    s = time.perf_counter()
    r = post("/verify", [("file", "p.jpg", probe, "image/jpeg"), ("helper", "h", helper, "application/octet-stream")],
             [("digest", t["digest"]), ("version", str(version))])
    return (time.perf_counter() - s) * 1000, r["match"]


for i in range(WARMUP):
    for fmt in ("fp32", "int8"):
        verify(fmt, PROBES[i % len(PROBES)])

lat = {"fp32": [], "int8": []}
misses = {"fp32": 0, "int8": 0}
for i in range(N):
    order = ("fp32", "int8") if i % 2 == 0 else ("int8", "fp32")
    for fmt in order:
        ms, match = verify(fmt, PROBES[i % len(PROBES)])
        lat[fmt].append(ms)
        misses[fmt] += not match
    if (i + 1) % 100 == 0:
        print(f"{i + 1}/{N}", flush=True)


def stats(xs):
    a = np.array(xs)
    return {"n": len(a), "mean": round(float(a.mean()), 1), "p50": round(float(np.percentile(a, 50)), 1),
            "p95": round(float(np.percentile(a, 95)), 1), "p99": round(float(np.percentile(a, 99)), 1),
            "max": round(float(a.max()), 1)}


out = {"layer": "ml-service /verify", "n_per_format": N,
       "fp32": {**stats(lat["fp32"]), "non_matches": misses["fp32"]},
       "int8": {**stats(lat["int8"]), "non_matches": misses["int8"]}}
print("RESULT " + json.dumps(out), flush=True)
