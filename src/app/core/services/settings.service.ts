import { Injectable } from '@angular/core';

import * as Storage from 'electron-json-storage';
import { from, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PluginService, MatchRule } from './plugin.service';

import * as Fs from 'fs';
import { ElectronService } from '.';

const PREFERENCES_KEY = 'sw_preferences';

export interface Preferences {
  version: number;
  baudrate?: number;
  prevPort?: string;
  newlineChar?: string;
  rules?: MatchRule[];

  // Maximum number of lines in terminal
  maxLines?: number;
}

const defaults: Preferences = {
  version: 2,
  baudrate: 115200,
  prevPort: undefined,
  newlineChar: '\n',
  maxLines: 1000,
  rules: [
    {
      enabled: true,
      template: 'info',
      color: '#296E99',
      destinations: {
        terminal: true
      }
    },
    {
      enabled: true,
      template: 'warning',
      color: '#B89025',
      destinations: {
        terminal: true
      }
    },
    {
      enabled: true,
      template: 'err',
      color: '#C21B15',
      destinations: {
        terminal: true
      }
    }
  ]
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  storage: typeof Storage;
  fs: typeof Fs;

  preferences: Preferences;

  public preferencesLoaded$ = new BehaviorSubject<boolean>(false);

  baudRateChanged = new BehaviorSubject<number>(defaults.baudrate);
  delimiterChanged = new BehaviorSubject<string>(defaults.newlineChar);
  maxLinesChanged = new BehaviorSubject<number>(defaults.maxLines);

  rules: MatchRule[] = [];
  public fixedRules: MatchRule[] = [];

  isElectron = () => {
    return window && window.process && window.process.type;
  }

  constructor(
    private pluginService: PluginService,
    private electronService: ElectronService
  ) {

    console.log('Init settings service');
    if (this.isElectron()) {

      this.storage = window.require('electron-json-storage');
      this.fs = window.require('fs');

      console.log('json storage:', this.storage.getDataPath());
      this.storage.has(PREFERENCES_KEY, (error: any, hasKey: boolean) => {
        if (error) throw error;

        if (hasKey) {
          this.storage.get(PREFERENCES_KEY, (error, data) => {
            if (error) throw error;

            console.log('loaded settings: ', data);
            this.preferences = <Preferences>data;
            if ((this.preferences.version || 0) < defaults.version) {
              console.log('Preferences outdates, using defaults');
              this.migrate();
              this.save();
            }
            this.preferencesLoaded$.next(true);
          });

        } else {
          console.log('Cannot find settings, use defaults instead');
          this.toDefaults();
          this.preferencesLoaded$.next(true);
        }
      });
    }

    this.fixedRules = this.pluginService.plugins.sort((a,b) => a.order - b.order).map(p => {
      let rule:MatchRule = {
        enabled: true,
        template: p.defaultTemplate,
        color: '#FFFFFF',
        destinations: {
        }
      };
      rule.destinations[p.name] = true;

      return rule;
    });
  }

  getPreferences() {
    return this.preferences;
  }

  migrate() {
    if (!this.preferences.maxLines) {
      this.preferences.maxLines = defaults.maxLines;
    }
    if (!this.preferences.rules) {
      this.preferences.rules = defaults.rules;
    }
    this.preferences.version = defaults.version;
  }

  toDefaults() {
    this.preferences = defaults;
    this.save();
  }

  export(suggestedFilename) {
    let filename = this.electronService.remote.dialog.showSaveDialogSync({
      title: 'Export settings to file…',
      message: 'For example, save the settings in your project repository',
      defaultPath: suggestedFilename,
      filters: [
       { name: 'JSON files', extensions: ['*.json'] }
      ]
    });
    if (filename) {
      console.log("saving ", filename)
      const content = JSON.stringify(this.preferences, null, 2);
      this.fs.writeFileSync(filename, content);
    }

  }

  import() {

    let filename = this.electronService.remote.dialog.showOpenDialogSync({
      title: 'Import settings file',
      filters: [
        { name: 'JSON files', extensions: ['*.json'] }
      ]
    });

    if (filename && filename.length) {

      const filecontent: string = this.fs.readFileSync(filename[0], {
        encoding: 'utf-8'
      });

      let loaded_preferences = undefined;
      try {
        loaded_preferences = JSON.parse(filecontent)
      }
      catch {
        this.electronService.remote.dialog.showErrorBox(
            `Error while loading file ${filename}`,
            "Invalid json"
          );
      }

      if (loaded_preferences) {
        this.preferences = <Preferences>loaded_preferences;
        if ((this.preferences.version || 0) < defaults.version) {
          this.migrate();
        }
        this.save();
        this.broadcastAllSettings();
        this.electronService.remote.dialog.showMessageBoxSync({
          message: "Settings loaded",
          type: 'info'
        });
      }
    }

  }

  broadcastAllSettings() {
    this.baudRateChanged.next(this.preferences.baudrate);
    this.maxLinesChanged.next(this.preferences.maxLines);
    this.delimiterChanged.next(this.preferences.newlineChar);
    this.preferencesLoaded$.next(true);
  }

  save() {
    this.storage.set(PREFERENCES_KEY, this.preferences, (error) => {
      if (error) throw error;
    });
  }

  isReady = () => from(this.preferencesLoaded$).pipe(filter(x => !!x));

  getPrefixColor(line: string) {
    if (!line || !this.preferences) {
      return ''
    }

    const rule = this.preferences.rules;
    for (let i=0; i < rule.length; i++) {
      if (line.match(rule[i].template)) {
        return rule[i].color;
      }
    }
    return '';
  }

  getRules() {
    if (!this.preferences) {
      return;
    }

    return this.preferences.rules.concat(this.fixedRules);
  }

  saveRules(rules: MatchRule[]) {
    if (!this.preferences) {
      return;
    }

    this.preferences.rules = rules;
    this.save();

    return true;
  }

  getBaudRate() {
    if (this.preferences) {
      return +this.preferences.baudrate || +defaults.baudrate;
    } else {
      return +defaults.baudrate;
    }
  }

  getDelimiter() {
    if (this.preferences) {
      return this.preferences.newlineChar || defaults.newlineChar;
    } else {
      return defaults.newlineChar;
    }
  }

  saveBaudRate(newbaudrate: number) {
    if (!this.preferences) {
      return;
    }

    if (this.preferences.baudrate === +newbaudrate) {
      return false;
    }

    this.preferences.baudrate = newbaudrate;
    this.save();
    this.baudRateChanged.next(this.preferences.baudrate);

    return true;
  }

  saveNewlineChar(char: string) {
    if (!this.preferences) {
      return;
    }

    if (this.preferences.newlineChar === char) {
      return false;
    }

    this.preferences.newlineChar = char;
    this.save();
    this.delimiterChanged.next(this.preferences.newlineChar);

    return true;
  }

  saveSelectedPort(path: string) {

    if (!this.preferences) {
      return;
    }

    this.preferences.prevPort = path;
    this.save();
  }

  getPreviousPort() {
    return this.preferences ? this.preferences.prevPort : defaults.prevPort;
  }

  saveMaxLines(maxLines: number) {
    this.preferences.maxLines = maxLines;
    this.save();

    this.maxLinesChanged.next(this.preferences.maxLines);
  }

  getMaxLines() {
    return this.preferences.maxLines;
  }


}
