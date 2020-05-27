import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SerialService } from './serial.service';
import { bufferTime, filter } from 'rxjs/operators';
import { PluginService, Plugin } from './plugin.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class DispatchService {

  private plugins: Plugin[] = [];

  constructor(
    private serialService: SerialService,
    private pluginService: PluginService,
    private settingsService: SettingsService
  ) {
    this.plugins = this.pluginService.plugins;

    let freq = 10;
    let delay_ms = 1000 / freq;

    this.serialService.textstream$.pipe(bufferTime(delay_ms), filter(x => !!x.length)).subscribe({
      next: (line) => this.parseAndDispatch(line)
    });
  }

  parseAndDispatch(lines: string[]) {

    if (lines.length > 1) {
    }
    let rules = this.settingsService.getRules();
    if (!lines.length || !rules || !rules.length) {
      return
    }

    let names = this.plugins.map(p => p.name);

    lines.forEach(line => {
      for (let rule of rules) {
        if (line.match(rule.template)) {
          for (let dest in rule.destinations) {
            if (rule.destinations[dest] === true) {
              let i = names.findIndex(n => n === dest);
              if (i >= 0) {
                // console.log('send to dest', dest, rule.destinations[dest], 'for pattern ', rule.template);
                if (this.plugins[i].removePrefix) {
                  line = line.slice(rule.template.length);
                }

                this.plugins[i].stream$.next(line);

              }
            }
          }
          break;
        }
      }
    });
  }
}
