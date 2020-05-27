import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Plugin {
  name: string,
  stream$: Subject<string>,
  defaultTemplate: string,
  order: number
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
    // this.settingsService.addDefaultMatchSettings(plugin.matchSettings);
  }

  get plugins() {
    return Array.from(this._plugins.values());
  }
}
