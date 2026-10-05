"""
M2 storage spike, part 2: fetch-by-primary-key latency and on-disk size per template size.
THROWAWAY SPIKE CODE. Uses a scratch database (storage_spike), never the app database; it must
exist and is dropped by the caller afterwards. Random bytes stand in for templates (P is
incompressible, so random bytes behave the same on disk).

Run on the compose network with --env-file .env (connects to host `db` with keyword args, so
the password can never end up in an error message).
"""

import json
import os
import secrets
import time

import numpy as np
import psycopg

ROWS = 1000
PROBES = 300
SIZES = {  # bytes per template, from storage_spike.py's formats
    "fp32 512 (baseline)": 512 * 512 * 4,
    "fp16 512": 512 * 512 * 2,
    "int8 512": 512 * 512 + 512 * 2,
    "fp16 256": 256 * 256 * 2,
    "fp16 128": 128 * 128 * 2,
}


def env(name: str) -> str:
    return os.environ[name].strip().strip("\"'")


conn = dict(host="db", dbname="storage_spike", user=env("POSTGRES_USER"), password=env("POSTGRES_PASSWORD"))
rng = np.random.default_rng(5)
out = {}
with psycopg.connect(**conn, autocommit=True) as db:
    for label, size in SIZES.items():
        db.execute("DROP TABLE IF EXISTS t")
        db.execute("CREATE TABLE t (id int PRIMARY KEY, digest bytea NOT NULL, helper bytea NOT NULL)")
        with db.cursor() as cur:
            cur.executemany("INSERT INTO t VALUES (%s, %s, %s)",
                            [(i, secrets.token_bytes(32), secrets.token_bytes(size)) for i in range(ROWS)])
        db.execute("VACUUM ANALYZE t")
        on_disk = db.execute("SELECT pg_total_relation_size('t')").fetchone()[0] / ROWS
        lat = []
        for i in rng.integers(0, ROWS, PROBES).tolist():
            s = time.perf_counter()
            db.execute("SELECT digest, helper FROM t WHERE id = %s", (i,)).fetchone()
            lat.append((time.perf_counter() - s) * 1000)
        out[label] = {"template_bytes": size, "on_disk_bytes_per_row": round(on_disk),
                      "fetch_p50_ms": round(float(np.percentile(lat, 50)), 2),
                      "fetch_p95_ms": round(float(np.percentile(lat, 95)), 2),
                      "tb_per_million_users": round(on_disk * 1e6 / 1e12, 3)}
        print(label, json.dumps(out[label]), flush=True)
    db.execute("DROP TABLE t")

with open("/repo/spikes/ironmask/data/storage_db_latency.json", "w") as f:
    json.dump(out, f, indent=1)
