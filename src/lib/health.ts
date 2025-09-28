// Health response shape from backend actuator/health endpoint.
// We only care about an optional string status but allow other keys without using `any`.
export interface HealthResponse {
    status?: string;
    [k: string]: unknown;
}

// Narrow unknown JSON to HealthResponse if it has an optional string `status` (or lacks it entirely but is an object)
export function isHealthResponse(value: unknown): value is HealthResponse {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    if ("status" in v && v.status !== undefined && typeof v.status !== "string")
        return false;
    return true;
}
