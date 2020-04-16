import { Injectable } from '@angular/core';

import { from, BehaviorSubject, timer } from 'rxjs';
import { map, switchMap, filter, first } from 'rxjs/operators';

import * as SerialPort from 'serialport';
import * as Readline from '@serialport/parser-readline'

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
  private readline: typeof Readline;

  private openPort;
  private availablePorts$ = new BehaviorSubject<SerialPortDesc[]>([]);
  private selectedPort$ = new BehaviorSubject<SerialPortDesc>(undefined);

  private dataStream$ = new BehaviorSubject<string>(undefined);

  private connectedDevice: SerialPortDesc;

  private databuffer: string[] = []
  private newLines = [];

  private maxLines = 10000;

  constructor() {
    this.serialport = window.require('serialport');
    this.readline = window. require('@serialport/parser-readline');

    // const list = this.serialport.list()
    this.updatePortsList();
    timer(100, 1000).subscribe(() => {
      this.updatePortsList();
    });


  }

  getDataStream() {
    return this.dataStream$.asObservable();
  }

  getSerialPorts() {
    return this.availablePorts$.asObservable();
  }

  updatePortsList() {
    from(this.serialport.list()).pipe(map(ports => {
      return ports.map(p => {
        const s = serialDescFromInfo(p)

        if (this.connectedDevice) {
          if ((this.connectedDevice.path == s.path) &&
              (this.connectedDevice.meta == s.meta) &&
              this.connectedDevice.connected &&
              !this.connectedDevice.port.isOpen)
          {
            console.log('reconnect!')
            this.connect(s);
          }
        }
        return s;
      });
    })).subscribe(newlist => {
      const currentList = this.availablePorts$.value || [];
      // SerialPort change detectioin
      let changed = newlist.filter(item => !currentList.find(c => c.path === item.path));
      changed = changed.concat(currentList.filter(item => !newlist.find(c => c.path === item.path)));

      if (changed.length) {
        this.availablePorts$.next(newlist);
      }
    })
  }

  getLines() {
    return this.databuffer;
  }
  connect(device: SerialPortDesc) {
    console.log('Connect to', device.path);
    const p = new this.serialport(device.path, {
      baudRate: 500000 // todo this.settingsService.getBaudRate(),
    });
    p.on('open', () => {
      this.connectedDevice = device;
      device.connected = true;
      device.port = p;
      // this.connectedDevice = device;
      const parser = p.pipe(new this.readline({ delimiter: '\n'}));
      parser.on('data', (data) => this.addIncomingData(data)); //this.dataStream$.next(data));

    });
    p.on('close', () => {
      console.log('[close] event for ', device.path);
    });
  }

  addIncomingData(data: string[]) {
    const K = this.databuffer.length + data.length - this.maxLines;
    this.databuffer = this.databuffer.slice(K).concat(data)
  }

  disconnect(device: SerialPortDesc) {
    console.log('Disconnect ', device.path);
    if (device) {
      device.port.close();
      device.connected = false;
    }
  }


  sendCommand(cmd: string) {
    const p = this.connectedDevice;
    if (p && p.port) {
      p.port.write(cmd);
      console.log('send cmd: ', cmd);
    }
  }
}
