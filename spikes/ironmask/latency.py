"""
Storage + 1:1 verify latency in Postgres: IronMask (bytea) vs raw embedding (pgvector).
THROWAWAY SPIKE CODE. Creates spike_* tables in the dev DB and drops them on exit.

Verify = fetch one template by primary key + compare; that is the only lookup 1:1
verification ever needs, so latency is measured as the table grows.
"""

import json
import os
import time

import numpy as np
import psycopg

from ironmask import DIM, Protected, protect, verify

ALPHA = 16
SIZES = [100, 1000, 2000]  # ~1 MB per protected row, so this tops out around 2 GB
PROBES = 200
OUT = "/spike/data/latency.json"

rng = np.random.default_rng(7)


def unit(n):
    v = rng.standard_normal((n, DIM))
    return v / np.linalg.norm(v, axis=1, keepdims=True)


def ms(samples):
    a = np.array(samples) * 1000
    return {"p50_ms": float(np.percentile(a, 50)), "p95_ms": float(np.percentile(a, 95))}


def env(name: str) -> str:
    # docker --env-file keeps literal quotes around values
    return os.environ[name].strip().strip("\"'")


results = {"alpha": ALPHA, "enrol": None, "sizes": []}
# Keyword args, not DATABASE_URL: that URL targets localhost (host-side), and psycopg echoes an
# unparseable conninfo string, password included, into the error message.
conn = dict(host="db", dbname=env("POSTGRES_DB"), user=env("POSTGRES_USER"), password=env("POSTGRES_PASSWORD"))
with psycopg.connect(**conn, autocommit=True) as db:
    db.execute("DROP TABLE IF EXISTS spike_protected, spike_plain")
    db.execute("CREATE TABLE spike_protected (id int PRIMARY KEY, digest bytea NOT NULL, helper bytea NOT NULL)")
    db.execute("CREATE TABLE spike_plain (id int PRIMARY KEY, embedding vector(512) NOT NULL)")
    try:
        enrol_times, n = [], 0
        for size in SIZES:
            for t in unit(size - n):
                start = time.perf_counter()
                tmpl = protect(t, ALPHA, rng)
                enrol_times.append(time.perf_counter() - start)
                db.execute("INSERT INTO spike_protected VALUES (%s, %s, %s)", (n, tmpl.digest, tmpl.helper.tobytes()))
                db.execute("INSERT INTO spike_plain VALUES (%s, %s::vector)", (n, str(t.tolist())))
                n += 1
            db.execute("VACUUM ANALYZE spike_protected")
            db.execute("VACUUM ANALYZE spike_plain")

            ids = rng.integers(0, n, PROBES).tolist()
            probes = unit(PROBES)
            prot, plain = [], []
            for i, p in zip(ids, probes):
                start = time.perf_counter()
                digest, helper = db.execute("SELECT digest, helper FROM spike_protected WHERE id = %s", (i,)).fetchone()
                verify(p, Protected(digest, np.frombuffer(helper, np.float32).reshape(DIM, DIM)), ALPHA)
                prot.append(time.perf_counter() - start)

                start = time.perf_counter()
                (emb,) = db.execute("SELECT embedding::real[] FROM spike_plain WHERE id = %s", (i,)).fetchone()
                float(np.dot(emb, p))
                plain.append(time.perf_counter() - start)

            size_of = lambda t: db.execute(f"SELECT pg_total_relation_size('{t}')").fetchone()[0]  # noqa: E731
            row = {
                "rows": n,
                "protected": {**ms(prot), "bytes_per_row": size_of("spike_protected") / n},
                "plain": {**ms(plain), "bytes_per_row": size_of("spike_plain") / n},
            }
            results["sizes"].append(row)
            print(row, flush=True)
        results["enrol"] = ms(enrol_times)
        print("enrol (QR + rotation):", results["enrol"])
    finally:
        db.execute("DROP TABLE IF EXISTS spike_protected, spike_plain")

with open(OUT, "w") as f:
    json.dump(results, f, indent=1)
