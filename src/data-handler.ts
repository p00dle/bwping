import { PingData } from './interfaces';

export const data: PingData[] = [];

export function dataHandlerFactory(period: number): [(pingData: PingData) => void, () => PingData[]] {
  const periodMs = period * 1000;
  function purgeData(){
    const expireAt = Date.now() - periodMs;
    while(data.length && data[0].timestamp < expireAt) {
      data.shift();
    }
  }
  function dataHandler(pingData: PingData){
    data.push(pingData);
  }
  function getData(): PingData[] {
    purgeData();
    return data;
  }
  return [dataHandler, getData];
}