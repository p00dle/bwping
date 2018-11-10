"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
class WinProcess {
    constructor(config, pingRate) {
        this.listeners = [];
        this.errorListeners = [];
        this.lastPingTime = Date.now();
        this.pingRate = pingRate;
        const { host, bytes, timeout, ttl } = config;
        this.processArgs = [host, '-l', bytes, '-w', timeout, '-i', ttl, '-n', '1'].map(a => '' + a);
        this.spawnNewProcess();
    }
    static parsePingOutput(str) {
        const matchReceived = str.match(WinProcess.rReceived);
        const matchMs = str.match(WinProcess.rMs);
        if (matchReceived && matchReceived[1] === '1' && matchMs) {
            return { timestamp: Date.now(), error: false, ms: parseInt(matchMs[1], 10) };
        }
        else {
            return { timestamp: Date.now(), error: true };
        }
    }
    runListeners(pingData) {
        this.listeners.forEach(listener => listener(pingData));
    }
    spawnNewProcess() {
        const process = cp.spawn(WinProcess.processFilePath, this.processArgs);
        const chunks = [];
        process.stdout.on('data', (chunk) => chunks.push(chunk.toString()));
        process.on('error', (err) => console.error(err));
        process.on('close', (code) => {
            if (code === 0) {
                this.runListeners(WinProcess.parsePingOutput(chunks.join('')));
            }
            else {
                this.runListeners({ timestamp: Date.now(), error: true });
            }
            const now = Date.now();
            const diff = now - this.lastPingTime;
            const nextPingTime = diff < this.pingRate ? this.pingRate - diff : 0;
            setTimeout(() => this.spawnNewProcess(), nextPingTime);
        });
    }
    onData(listener) {
        this.listeners.push(listener);
    }
}
WinProcess.processFilePath = process.env.SystemRoot + '/system32/ping.exe';
WinProcess.rReceived = /Received = (\d)/;
WinProcess.rMs = /Minimum = (\d+)/;
exports.WinProcess = WinProcess;
//# sourceMappingURL=win.js.map