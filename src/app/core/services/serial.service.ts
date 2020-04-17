import { Injectable } from '@angular/core';

import { from, BehaviorSubject, timer } from 'rxjs';
import { map, switchMap, filter, first } from 'rxjs/operators';

import * as SerialPort from 'serialport';
import * as Readline from '@serialport/parser-readline'

export class SerialPortDesc {
  public removed: boolean = false;
  public connected: boolean = false;
  public path: string;
  public meta: string;
  public port: SerialPort;

  constructor(public info: SerialPort.PortInfo) {
    this.path = info.path;
    this.meta = info.manufacturer + '/' + info.serialNumber;
  }

  equals(other: SerialPortDesc) {
    return (this.path == other.path) && (this.meta == other.meta);
  }
}

@Injectable({
  providedIn: 'root'
})
export class SerialService {

  private serialport: typeof SerialPort;
  private readline: typeof Readline;

  private availablePorts$ = new BehaviorSubject<SerialPortDesc[]>([]);

  private connectedDevice: SerialPortDesc;

  private databuffer: string[] = []

  private maxLines = 10000;

  constructor() {
    this.serialport = window.require('serialport');
    this.readline = window. require('@serialport/parser-readline');

    this.updatePortsList();
    timer(100, 1000).subscribe(() => {
      this.updatePortsList();
    });


  }

  getSerialPorts() {
    return this.availablePorts$.asObservable();
  }

  updatePortsList() {
    from(this.serialport.list()).pipe(map(ports => {
      return ports.map(p => {
        const s = new SerialPortDesc(p);

        if (this.connectedDevice) {
          if (this.connectedDevice.equals(s) && !this.connectedDevice.port.isOpen) {
            console.log('reconnect!')
            this.connect(s);
          }
        }
        return s;
      });
    })).subscribe(newlist => {
      const currentList = this.availablePorts$.value || [];
      // SerialPort change detection
      let added = newlist.filter(item => !currentList.find(c => c.path === item.path));
      const removed = currentList.filter(item => !newlist.find(c => c.path === item.path));

      // changed = changed.concat(currentList.filter(item => !newlist.find(c => c.path === item.path)));
      if (added.length || removed.length) {
        this.availablePorts$.next(newlist);
      }

    })
  }

  getLines() {
    return this.databuffer;
  }
  connect(device: SerialPortDesc) {
    if (this.connectedDevice && this.connectedDevice.port.isOpen) {
      console.log('disconnecting other device first');
      this.disconnect(this.connectedDevice);
    }
    console.log('Connect to', device.path);
    const p = new this.serialport(device.path, {
      baudRate: 500000 // todo this.settingsService.getBaudRate(),
    });
    p.on('open', () => {
      console.log('[open] event for ', device.path);
      this.connectedDevice = device;
      device.connected = true;
      device.port = p;
      const parser = p.pipe(new this.readline({ delimiter: '\n'}));
      parser.on('data', (data) => this.addIncomingData(data)); //this.dataStream$.next(data));
      this.updatePortsList();

    });
    p.on('close', () => {
      console.log('[close] event for ', device.path);
      this.updatePortsList();
    });
  }

  addIncomingData(data: string[]) {
    const K = this.databuffer.length + data.length - this.maxLines;
    this.databuffer = this.databuffer.slice(K).concat(data)
  }

  disconnect(device: SerialPortDesc) {
    if (device) {
      console.log('Disconnect ', device.path);
      if (device.port.isOpen) {
        device.port.close();
      }
      device.connected = false;
      this.connectedDevice = null;
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
