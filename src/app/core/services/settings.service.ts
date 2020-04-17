import { Injectable } from '@angular/core';

import * as Storage from 'electron-json-storage';
import { Subject, from, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

const PREFERENCES_KEY = 'sw_preferences';

interface Preferences {
  baudrate?: number;
  prevPort?: string;
  newlineChar?: string;
}

const defaults: Preferences = {
  baudrate: 115200,
  prevPort: undefined,
  newlineChar: '\n'
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  storage: typeof Storage;

  preferences: Preferences;

  public preferencesLoaded$ = new Subject<boolean>();

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

        console.log(data);
        this.preferences = <Preferences>data;
        this.preferencesLoaded$.next(true);
      });
    }
  }

  isReady = () => from(this.preferencesLoaded$).pipe(filter(x => !!x));

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
      // too soon.. todo should we remember this?
      return;
    }

    if (this.preferences.baudrate === +newbaudrate) {
      return false;
    }

    this.preferences.baudrate = newbaudrate;
    this.storage.set(PREFERENCES_KEY, this.preferences, (error) => {
      if (error) throw error;
    });
    this.baudRateChanged.next(this.preferences.baudrate);

    return true;
  }

  saveNewlineChar(char: string) {
    if (!this.preferences) {
      // too soon.. todo should we remember this?
      return;
    }

    if (this.preferences.newlineChar === char) {
      return false;
    }

    this.preferences.newlineChar = char;
    this.storage.set(PREFERENCES_KEY, this.preferences, (error) => {
      if (error) throw error;
    });
    this.delimiterChanged.next(this.preferences.newlineChar);

    return true;
  }

  saveSelectedPort(path: string) {

    if (!this.preferences) {
      // too soon.. todo should we remember this?
      return;
    }
    this.preferences.prevPort = path;
    this.storage.set(PREFERENCES_KEY, this.preferences, (error) => {
      if (error) throw error;
    });
  }

  getPreviousPort() {
    return this.preferences ? this.preferences.prevPort : defaults.prevPort;
  }


}
