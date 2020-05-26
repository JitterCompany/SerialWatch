import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SerialService } from './serial.service';
import { bufferTime } from 'rxjs/operators';
import { PluginService } from './plugin.service';

@Injectable({
  providedIn: 'root'
})
export class DispatchService {

  private plugins;

  constructor(
    private serialService: SerialService,
    private pluginService: PluginService
  ) {
    this.plugins = this.pluginService.plugins;

    let freq = 10;
    let delay_ms = 1000 / freq;

    this.serialService.textstream$.pipe(bufferTime(delay_ms)).subscribe({
      next: (line) => this.parseAndDispatch(line)
    });
  }

  parseAndDispatch(lines: string[]) {
    lines.forEach(line => {
      for (let p of this.plugins) {
        p.stream$.next(line);
      }
    });
  }
}
