import { Injectable } from '@angular/core';

import * as SerialPort from 'serialport';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SerialService {

  private serialport: typeof SerialPort;

  constructor() {
    this.serialport = window.require('serialport');

    // const list = this.serialport.list()
    from(this.serialport.list()).subscribe(list => {
      console.log('port list:', list)
    })
  }
}
