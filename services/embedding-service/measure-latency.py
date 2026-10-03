"""
Embedding Service Latency & Cold-Start Measurement Script

Measures:
1. Cold-start latency (first inference request)
2. Warm query latency (Min, Median, Mean, P95, P99, Max over N iterations)
3. Batch passage throughput (Batch sizes: 1, 4, 8, 16)

Usage:
    python measure-latency.py --url http://localhost:8080 --secret my_secret
    python measure-latency.py --url https://makeovers-embedding-service-xxx.a.run.app --secret my_secret
"""

import time
import argparse
import statistics
import requests

def run_benchmarks(service_url: str, secret: str, iterations: int = 50):
    headers = {
        "Content-Type": "application/json",
        "x-service-secret": secret,
    }

    embed_url = f"{service_url.rstrip('/')}/embed"
    health_url = f"{service_url.rstrip('/')}/health"

    print("======================================================================")
    print("⚡ EMBEDDING SERVICE LATENCY & THROUGHPUT BENCHMARK")
    print(f"Target URL: {service_url}")
    print(f"Iterations: {iterations}")
    print("======================================================================\n")

    # 1. Health Check
    try:
        t0 = time.perf_counter()
        resp = requests.get(health_url, timeout=10)
        t_health = (time.perf_counter() - t0) * 1000
        if resp.status_code == 200:
            data = resp.json()
            print(f"✅ Health Check OK in {t_health:.1f}ms | Model: {data.get('model')} | Device: {data.get('device')}")
        else:
            print(f"⚠️ Health Check returned status {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # 2. Cold-Start / First Request Latency
    cold_payload = {
        "texts": ["What is your poshak draping and Rajputi bridal package rate?"],
        "input_type": "query",
    }

    print("\n▶ Measuring First Request (Cold-Start Inference)...")
    t0 = time.perf_counter()
    resp = requests.post(embed_url, json=cold_payload, headers=headers, timeout=30)
    cold_latency_ms = (time.perf_counter() - t0) * 1000

    if resp.status_code != 200:
        print(f"❌ First request failed with status {resp.status_code}: {resp.text}")
        return

    print(f"⏱️ First Request Latency: {cold_latency_ms:.1f} ms")

    # 3. Warm Single-Query Latencies
    print(f"\n▶ Running {iterations} Warm Query Embeddings...")
    warm_latencies = []
    test_queries = [
        "What is your cancellation and refund policy?",
        "Do you travel to destination weddings in Jaipur?",
        "How much does HD airbrush makeup last during wedding pheras?",
        "Is poshak draping included with bridal hair extensions?",
        "How many months in advance should I book my wedding date?",
    ]

    for i in range(iterations):
        q = test_queries[i % len(test_queries)]
        payload = {"texts": [q], "input_type": "query"}

        t0 = time.perf_counter()
        resp = requests.post(embed_url, json=payload, headers=headers, timeout=10)
        dt_ms = (time.perf_counter() - t0) * 1000

        if resp.status_code == 200:
            warm_latencies.append(dt_ms)
        else:
            print(f"  Warning: Request {i+1} failed with status {resp.status_code}")

    warm_latencies.sort()
    n = len(warm_latencies)

    p50 = warm_latencies[int(n * 0.50)]
    p95 = warm_latencies[int(n * 0.95)]
    p99 = warm_latencies[int(n * 0.99)] if n >= 100 else warm_latencies[-1]
    mean_val = statistics.mean(warm_latencies)
    min_val = warm_latencies[0]
    max_val = warm_latencies[-1]

    print("\n----------------------------------------------------------------------")
    print(f"📊 Single Query Latency Distribution (N={n}):")
    print(f"  • Min:    {min_val:.1f} ms")
    print(f"  • P50:    {p50:.1f} ms (Median)")
    print(f"  • Mean:   {mean_val:.1f} ms")
    print(f"  • P95:    {p95:.1f} ms")
    print(f"  • P99:    {p99:.1f} ms")
    print(f"  • Max:    {max_val:.1f} ms")
    print("----------------------------------------------------------------------")

    # 4. Batch Passage Throughput Benchmark
    print("\n▶ Measuring Batch Passage Throughput...")
    batch_sizes = [1, 4, 8, 16]
    sample_passage = "Makeovers by Prachi provides premier royal Rajputi bridal makeover services across Jodhpur, Jaipur and Udaipur."

    print("Batch Size | Total Latency (ms) | Latency Per Passage (ms)")
    print("----------------------------------------------------------")
    for bs in batch_sizes:
        payload = {
            "texts": [f"[{i}] {sample_passage}" for i in range(bs)],
            "input_type": "passage",
        }
        t0 = time.perf_counter()
        resp = requests.post(embed_url, json=payload, headers=headers, timeout=15)
        dt_ms = (time.perf_counter() - t0) * 1000
        if resp.status_code == 200:
            per_item = dt_ms / bs
            print(f"    {str(bs).rjust(2)}     |     {dt_ms:.1f} ms      |       {per_item:.1f} ms")
        else:
            print(f"    {str(bs).rjust(2)}     |     FAILED ({resp.status_code})")

    print("\n======================================================================\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Benchmark Embedding Microservice Latency")
    parser.add_argument("--url", default="http://localhost:8080", help="Service base URL")
    parser.add_argument("--secret", default="", help="Service secret header value")
    parser.add_argument("--n", type=int, default=30, help="Number of benchmark iterations")
    args = parser.parse_args()

    run_benchmarks(args.url, args.secret, args.n)
