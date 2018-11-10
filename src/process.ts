import * as os from 'os';
import { Process, Config } from './interfaces';
import { WinProcess } from './platforms/win';

export function processFactory(config: Config, pingRate: number): Process {
  const platform = os.platform();

  switch(platform){
    case 'win32': return new WinProcess(config, pingRate);
    default:
      throw Error(`Platform '${platform}' not supported`);
  }
}