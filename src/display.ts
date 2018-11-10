import { PingData } from './interfaces';
import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';

blessed.colors
interface Counts {
  min: number;
  max: number;
  avg: number;
  timeouts: number;
}

interface Strings {
  min: string;
  max: string;
  avg: string;
  timeouts: string;
}

interface InThreshold {
  min: boolean;
  max: boolean;
  avg: boolean;
  timeouts: boolean;  
}

function getCounts(data: PingData[]): Counts {
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  let timeouts = 0;
  let count = 0;
  for (const pingData of data){
    if (pingData.error) {
      timeouts++;
    } else {
      count++;
      const { ms } = pingData;
      sum += ms;
      if ( ms < min ) {
        min = ms;
      }
      if ( ms > max ) {
        max = ms;
      }
    }
  }
  const avg = Math.round(sum / count);
  return {  min, max, avg, timeouts }
}

function getInThreshold(counts: Counts, threshold: number): InThreshold {
  const { min, max, avg, timeouts } = counts;
  return {
    min: isFinite(min) && min < threshold,
    max: isFinite(max) && max < threshold,
    avg: !isNaN(avg) && avg < threshold,
    timeouts: timeouts === 0
  }
}

function getStrings(counts: Counts): Strings {
  const { min, max, avg, timeouts } = counts;
  return {
    min: isFinite(min) ? min + 'ms' : 'N/A',
    max: isFinite(max) ? max + 'ms' : 'N/A',
    avg: isFinite(avg) ? avg + 'ms' : 'N/A',
    timeouts: '' + timeouts
  }

}

interface LineData {
  title: string;
  x: string[];
  y: number[];
}

function getGraphData(data: PingData[], threshold: number): [LineData] {
  const pings = { title: 'Ping', x: [], y: []  }
  for (const ping of data) {
    pings.x.push(' ');
    pings.y.push(ping.ms || 0);
  }
  return [pings]
}

const screen = blessed.screen();
const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

const boxes: {[name: string]: blessed.Widgets.TextElement} = {
  min: grid.set(0, 0, 1, 3, blessed.text, {label: 'Minimum', color: 'red' }) as blessed.Widgets.TextElement,
  max: grid.set(0, 3, 1, 3, blessed.box, {label: 'Maximum', color: 'red'}) as blessed.Widgets.TextElement,
  avg: grid.set(0, 6, 1, 3, blessed.box, {label: 'Average', color: 'red'}) as blessed.Widgets.TextElement,
  timeouts: grid.set(0, 9, 1, 3, blessed.box, {label: 'Timeouts', color: 'red'}) as blessed.Widgets.TextElement
}

const graph = grid.set(1, 0, 4, 12, contrib.line, {
  label: 'Latency',
});

screen.render();


export function displayFactory(getData: () => PingData[], threshold: number): () => void {
  return function display(){
    const data = getData();
    const graphData = getGraphData(data, threshold);
    const counts = getCounts(data);
    const inThreshold = getInThreshold(counts, threshold);
    const strings = getStrings(counts);
    Object.keys(boxes).forEach(key => {
      const box = boxes[key];
      box.setContent(strings[key]);
      box.style.bg = inThreshold[key] ? '#00ff00' : '#ff00000';
      // box.setOptions({color: inThreshold[key] ? 'green' : 'red'});
    });
    graph.setData(graphData);
    screen.render();
  }
}