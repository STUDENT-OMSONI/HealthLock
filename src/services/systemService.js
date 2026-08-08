import { request } from "./apiClient";

// System-level infrastructure metrics (CPU, memory, DB connection, API
// latency) can only be measured by a real running server -- there is no
// way for browser JavaScript to know the CPU/memory usage of a machine it
// isn't running on. Until the Phase 2 backend exists, this returns
// realistic-looking simulated values, clearly flagged with `simulated: true`
// so the UI can (and does) label them honestly instead of presenting them
// as genuine measurements.
//
// TODO (Phase 2 backend): implement a real `/api/system/status` endpoint
// that reads actual OS metrics (e.g. via Node's `os` module or a monitoring
// agent) and returns real numbers here instead.

function mockSystemStatus() {
  return {
    cpuUsagePercent: Math.round(20 + Math.random() * 40),
    memoryUsagePercent: Math.round(30 + Math.random() * 35),
    databaseStatus: "disconnected", // genuinely true -- no DB is connected yet
    apiResponseTimeMs: Math.round(150 + Math.random() * 250), // matches apiClient's simulated latency
    activeUsers: 1, // genuinely accurate for a local single-browser session
    simulated: true,
  };
}

export async function getSystemStatus() {
  return request("/system/status", { mockResolver: mockSystemStatus });
}
