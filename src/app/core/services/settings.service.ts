import { Injectable } from '@angular/core';

import * as Storage from 'electron-json-storage';
import { Subject, from, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

const PREFERENCES_KEY = 'sw_preferences';

export interface PrefixColor {
  prefix: string;
  color: string;
}

interface Preferences {
  baudrate?: number;
  prevPort?: string;
  newlineChar?: string;
  prefixColors?: PrefixColor[];
}

const defaults: Preferences = {
  baudrate: 115200,
  prevPort: undefined,
  newlineChar: '\n',
  prefixColors: [
    {prefix: 'info', color: '#0000FF'},
    {prefix: 'warning', color: '#FFFF00'},
    {prefix: 'error', color: '#FF0000'},
  ]
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  storage: typeof Storage;

  preferences: Preferences;

  public preferencesLoaded$ = new BehaviorSubject<boolean>(false);

  baudRateChanged = new BehaviorSubject<number>(defaults.baudrate);
  delimiterChanged = new BehaviorSubject<string>(defaults.newlineChar);

  isElectron = () => {
    return window && window.process && window.process.type;
  }

  constructor() {
    console.log('Init settings service');
    if (this.isElectron()) {

      this.storage = window.require('electron-json-storage');

      this.storage.get(PREFERENCES_KEY, (error, data) => {
        if (error) throw error;

        console.log('loaded settings: ', data);
        this.preferences = <Preferences>data;
        this.preferencesLoaded$.next(true);
      });
    }
  }

  toDefaults() {
    this.preferences = defaults;
    this.save();
  }

  save() {
    this.storage.set(PREFERENCES_KEY, this.preferences, (error) => {
      if (error) throw error;
    });
  }

  isReady = () => from(this.preferencesLoaded$).pipe(filter(x => !!x));

  getPrefixColors() {
    return this.preferences.prefixColors;
  }


  savePrefixColors(prefixColors: PrefixColor[]) {
    if (!this.preferences) {
      return;
    }

    this.preferences.prefixColors = prefixColors;
    this.save();
    // this.prefixColorsChanged.next(this.preferences.prefixColors);

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


}
