import { Process, Config, PingData } from '../interfaces';
import * as cp from 'child_process';

export class WinProcess implements Process {

  static processFilePath: string = process.env.SystemRoot + '/system32/ping.exe';
  private processArgs: string[];
  private listeners: ((pingData: PingData) => void)[] = [];
  private errorListeners: ((err: Error) => void)[] = [];
  private pingRate: number;
  private lastPingTime: number = Date.now();
  static rReceived: RegExp = /Received = (\d)/
  static rMs: RegExp = /Minimum = (\d+)/
  static parsePingOutput(str: string): PingData {
    const matchReceived = str.match(WinProcess.rReceived);
    const matchMs = str.match(WinProcess.rMs);
    if (matchReceived && matchReceived[1] === '1' && matchMs) {
      return { timestamp: Date.now(), error: false, ms: parseInt(matchMs[1], 10)}
    } else {
      return { timestamp: Date.now(), error: true }
    }
  }
  private runListeners(pingData: PingData) {
    this.listeners.forEach(listener => listener(pingData));
  }
  private spawnNewProcess(){
    const process = cp.spawn(WinProcess.processFilePath, this.processArgs);
    const chunks = [];
    process.stdout.on('data', (chunk) => chunks.push(chunk.toString()));
    process.on('error', (err) => console.error(err));
    process.on('close', (code) => {
      if (code === 0) {
        this.runListeners(WinProcess.parsePingOutput(chunks.join(''))) 
      } else {
        this.runListeners({timestamp: Date.now(), error: true});
      }
      const now = Date.now();
      const diff = now - this.lastPingTime;
      const nextPingTime = diff < this.pingRate ? this.pingRate - diff : 0;
      setTimeout(() => this.spawnNewProcess(), nextPingTime);
    });
  }
  constructor(config: Config, pingRate: number){
    this.pingRate = pingRate;
    const { host, bytes, timeout, ttl } = config;
    this.processArgs =  [host, '-l', bytes, '-w', timeout, '-i', ttl, '-n', '1'].map(a => '' + a);
    this.spawnNewProcess();
  }

  public onData(listener){
    this.listeners.push(listener);
  }
}