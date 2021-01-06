import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Plugin {
  name: string,
  stream$: Subject<SerialUnit>,
  defaultTemplate: string,
  order: number
  removePrefix: boolean;
}

export interface MatchRule {
  enabled: boolean,
  template: string,
  color: string,
  destinations: {}
}

export interface SerialUnit {
  line: string,
  rule: MatchRule
}

@Injectable({
  providedIn: 'root'
})
export class PluginService {

  private _plugins = new Map<string, Plugin>();

  constructor() {
    console.log( "PluginService constructor.");
  }

  registerPlugin(plugin: Plugin) {
    console.log('register plugin: ', plugin.name);
    this._plugins.set(plugin.name, plugin);
  }

  get plugins() {
    return Array.from(this._plugins.values());
  }


  parseAndDispatch(lines: string[], rules: MatchRule[]) {

    if (!lines.length || !rules || !rules.length) {
      return
    }

    let names = this.plugins.map(p => p.name);

    lines.forEach(line => {
      for (let rule of rules) {
        if (rule.enabled && line.match(rule.template)) {
          for (let dest in rule.destinations) {
            if (rule.destinations[dest] === true) {
              let i = names.findIndex(n => n === dest);
              if (i >= 0) {
                // console.log('send to dest', dest, rule.destinations[dest], 'for pattern ', rule.template);
                if (this.plugins[i].removePrefix) {
                  line = line.slice(rule.template.length);
                }

                this.plugins[i].stream$.next({line, rule});

              }
            }
          }
          break;
        }
      }
    });
  }
}
