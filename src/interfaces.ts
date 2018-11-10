export interface Process {
  onData: (listener: (data: PingData) => void) => void
}

export interface PingData {
  timestamp: number;
  error: boolean;
  ms?: number;
}

export interface Config {
  host: string;
  timeout: number;
  threshold: number;
  ttl: number;
  bytes: number;
  period: number;
  refreshRate: number;
  pingRate: number;
}