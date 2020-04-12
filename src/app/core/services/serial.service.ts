import { Injectable } from '@angular/core';

import * as SerialPort from 'serialport';
import { from, BehaviorSubject } from 'rxjs';
import { map, switchMap, filter, first } from 'rxjs/operators';

export interface SerialPortDesc {
  path: string;
  meta: string;
  connected: boolean;
  info: SerialPort.PortInfo;
  port: SerialPort
}

function serialDescFromInfo(p: SerialPort.PortInfo) {
  let meta = ''
  if (p.manufacturer || p.serialNumber) {
    meta = p.manufacturer + '/' + p.serialNumber;
  }
  const desc: SerialPortDesc = {
    path: p.path,
    meta: meta,
    connected: false,
    info: p,
    port: null
  };

  return desc;
}

@Injectable({
  providedIn: 'root'
})
export class SerialService {

  private serialport: typeof SerialPort;

  private openPort;
  private availablePorts$ = new BehaviorSubject<SerialPortDesc[]>([]);
  private selectedPort$ = new BehaviorSubject<SerialPortDesc>(undefined);

  constructor() {
    this.serialport = window.require('serialport');

    // const list = this.serialport.list()
    from(this.serialport.list()).pipe(map(ports => {
      return ports.map(p => serialDescFromInfo(p));
    })).subscribe(list => {
      console.log('port list:', list)
      this.availablePorts$.next(list);
    })
  }

  getSerialPorts() {
    return this.availablePorts$.asObservable();
  }

  updatePortsList() {
    // from(this.serialport.list()).pipe(map(ports => ports.filter(x => !!x['serialNumber']).map(p => {

    // }
  }

  connect(device: SerialPortDesc) {
    console.log('Connect to', device.path);
    const p = new this.serialport(device.path, {
      baudRate: 500000 // todo this.settingsService.getBaudRate(),
    });
    p.on('open', () => {
      device.connected = true;
      device.port = p;
      // this.connectedDevice = device;
    });
    p.on('close', () => {
      console.log('[close] event for ', device.path);
      // this.updatePortsList();
    });
  }


  disconnect(device: SerialPortDesc) {
    console.log('Disconnect ', device.path);
    if (device) {
      device.port.close();
      device.connected = false;
    }
  }


}
