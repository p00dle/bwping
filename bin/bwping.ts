#!/usr/bin/env node

import * as program from 'commander';
import { Config } from '../src/interfaces';
import * as path from 'path';
import * as fs from 'fs';
import { processFactory } from '../src/process';
import { dataHandlerFactory } from '../src/data-handler';
import { displayFactory } from '../src/display';

const configPath = path.join(__dirname, '../config.json');
const defaults: Config = require(configPath) as Config;

program
  .version('0.1.0', '-v, --version')
  .option('-h, --host [host]', 'Host to be pinged', defaults.host)
  .option('-o, --timeout <n>', 'Timeout of pings in milliseconds', parseInt, defaults.timeout)
  .option('-t, --threshold <n>', 'Threshold above which text becomes red', parseInt, defaults.threshold)
  .option('-T, --ttl <n>', 'Time To Live', parseInt, defaults.ttl)
  .option('-b, --bytes <n>', 'Size of ping packets in bytes', parseInt, defaults.bytes)
  .option('-p, --period <n>', 'Ping measurement period in seconds', parseInt, defaults.period)
  .option('-r, --refresh-rate <n>', 'Refresh rate in milliseconds', parseInt, defaults.refreshRate)
  .option('-p, --ping-rate', 'Ping rate in milliseconds', parseInt, defaults.pingRate)
  .option('-s, --save', 'Saves the provided options as default')
  .parse(process.argv);

const { host, timeout, ttl, bytes, period, refreshRate, threshold, save, pingRate } = program;
const config = { host, timeout, ttl, bytes, period, refreshRate, threshold, pingRate }

if (save){
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('Config successfully updated');
}

const [dataHandler, getData] = dataHandlerFactory(period)
const pingProcess = processFactory(config, pingRate);
pingProcess.onData(dataHandler);
const display = displayFactory(getData, threshold);
setInterval(display, refreshRate);