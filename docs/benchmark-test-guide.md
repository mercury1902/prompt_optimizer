# Benchmark Test Guide

## Goal

Đánh giá thực tế mức đạt bài toán gốc:

- User không còn ngợp command khi chọn lệnh.
- Prompt optimizer gợi ý command/workflow đúng ngữ cảnh.
- Giữ nguyên model chính: **Kimi 2.5 Turbo (FirePass)**.

## Benchmark Suites

### 1) Offline benchmark (reproducible)

File:
- `tests/benchmark/command-discovery-success-benchmark.test.ts`
- `tests/benchmark/telemetry-ranking-learning-benchmark.test.ts`

Đo:
- `Top-1 command discovery rate` (target >= 80% theo PDR)
- `Top-3 coverage`
- `P95 ranking latency`
- `Telemetry learning uplift` sau tín hiệu `shown/clicked/run/success`

Chạy:

```bash
npm run benchmark
```

### 2) Live benchmark với FirePass (real API)

File:
- `tests/benchmark/live-firepass-kimi-prompt-optimizer-benchmark.test.ts`

Đo:
- Tính hợp lệ output schema optimizer
- Tỷ lệ command gợi ý khớp tập kỳ vọng
- P95 latency từ API thật

Điều kiện chạy:
- Có `PUBLIC_FIREPASS_API_KEY`
- Bật cờ `RUN_LIVE_BENCHMARK=1`

PowerShell:

```powershell
$env:RUN_LIVE_BENCHMARK="1"
npm run benchmark:live
```

## Full Validation Pack

```bash
npm run benchmark
npm run test
npm run build
```

Nếu muốn chạy cả benchmark live trong cùng pipeline:

```bash
npm run benchmark:all
```

Lưu ý: `benchmark:live` sẽ tự skip khi thiếu `RUN_LIVE_BENCHMARK` hoặc API key.
