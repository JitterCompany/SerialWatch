import { Injectable } from '@angular/core';

import { from, BehaviorSubject, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import * as SerialPort from 'serialport';
import * as Readline from '@serialport/parser-readline'
import { SettingsService } from './settings.service';

export interface SerialPortCallbacks {
  open: () => void;
  close: () => void;
}

function hexStringToByte(str: string): Uint8Array {
  if (!str) {
    return new Uint8Array();
  }

  let a = [];
  for (let i = 0, len = str.length; i < len; i+=2) {
    a.push(parseInt(str.substr(i,2),16));
  }

  return new Uint8Array(a);
}

/**
 * available connected
 * 1         0
 * 1         1
 * 0         1
 **/

export class SerialPortDesc {
  public removed: boolean = false;
  public connected: boolean = false;
  public available: boolean = false;
  public path: string;
  public meta: string;
  public port: SerialPort;

  constructor(public info: SerialPort.PortInfo) {
    this.available = true;
    this.path = info.path;
    this.meta = info.manufacturer + '/' + info.serialNumber;
  }

  equals(other: SerialPortDesc) {
    if (!other) {
      return false;
    }
    return (this.path == other.path) && (this.meta == other.meta);
  }

  connect(serial, baudRate: number, cb: SerialPortCallbacks) {
    if (!this.available) {
      // autoconnect on next availability
      this.connected = true;
      return;
    }

    this.port = new serial(this.path, {baudRate});

    this.port.on('open', () => {
      this.connected = true;
      cb.open();
    });
    this.port.on('close', cb.close);
  }

  disconnect() {
    if (this.port && this.port.isOpen) {
      this.port.close();
    }
    this.connected = false;
  }

  update(update: SerialPort.UpdateOptions) {
    if (this.port && this.port.open) {
      this.port.update(update);
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class SerialService {

  private serialport: typeof SerialPort;
  private readline: typeof Readline;
  private parser;

  private availablePorts$ = new BehaviorSubject<SerialPortDesc[]>([]);

  private connectedDevice: SerialPortDesc;

  private databuffer: string[] = []

  private maxLines = 10000;

  constructor(
    private settings: SettingsService
  ) {
    this.serialport = window.require('serialport');
    this.readline = window. require('@serialport/parser-readline');


    this.updatePortsList();
    timer(100, 1000).subscribe(() => {
      this.updatePortsList();
    });


    this.settings.baudRateChanged.subscribe(baudRate => {
      if (this.connectedDevice) {
        this.connectedDevice.update({baudRate});
      }
    });

    this.settings.delimiterChanged.subscribe(delimiter => {
      if (this.parser) {
        this.parser.delimiter = delimiter;
      }
    })
  }

  getSerialPorts() {
    return this.availablePorts$.asObservable();
  }

  updatePortsList() {
    from(this.serialport.list()).pipe(map(ports => {
      return ports.map(p => new SerialPortDesc(p)); //TODO: add black/white list filtering here
    })).subscribe(newlist => {
      const currentList = this.availablePorts$.value || [];
      // SerialPort change detection
      const added = newlist.filter(item => !currentList.find(c => c.path === item.path));
      const removed = currentList.filter(item => (item.available === true) && !newlist.find(c => c.path === item.path));
      const readded = currentList.filter(item => (item.available === false) && newlist.find(c => (c.path === item.path)));
      // console.log(`added: ${added.length}, removed: ${removed.length}, re-added: ${readded.length}`)

      removed.forEach(dev => {
        dev.available = false;
      });

      readded.forEach(dev => {
        dev.available = true;
        console.log('set available', dev.path, this.connectedDevice.equals(dev), (!this.connectedDevice.port || !this.connectedDevice.port.isOpen));
        if (this.connectedDevice && this.connectedDevice.equals(dev) && (!this.connectedDevice.port || !this.connectedDevice.port.isOpen)) {
          console.log('reconnect!')
          this.connect(dev);
        }
      });

      if (added.length || removed.length || readded.length) {
        this.availablePorts$.next(currentList.concat(added));
      }

    })
  }

  getLines() {
    return this.databuffer;
  }

  refreshList() {
    this.availablePorts$.next([]);
  }

  connect(device: SerialPortDesc) {
    if (!device) {
      return;
    }

    if (this.connectedDevice && this.connectedDevice.port && this.connectedDevice.port.isOpen) {
      console.log('disconnecting other device first');
      this.disconnect(this.connectedDevice);
    }

    this.connectedDevice = device;
    device.connect(this.serialport, this.settings.getBaudRate(), {
      open: () => {
        console.log('[open] event for ', device.path);
        this.parser = this.connectedDevice.port.pipe(new this.readline({ delimiter: this.settings.getDelimiter()}));
        this.parser.on('data', (data) => this.addIncomingData(data));
      },
      close: () => {
        console.log('[close] event for ', device.path);
      }
    });
  }

  addIncomingData(data: string[]) {
    const K = this.databuffer.length + data.length - this.maxLines;
    this.databuffer = this.databuffer.slice(K).concat(data)
  }

  disconnect(device: SerialPortDesc) {
    if (device) {
      console.log('Disconnect ', device.path);
      device.disconnect();
      this.connectedDevice = null;
    }
  }

  /**
   *
   * @param cmd
   * @param cmdType 'ASCII' or 'HEX'
   */
  sendCommand(cmd: string, cmdType: string) {
    const p = this.connectedDevice;
    if (p && p.port) {
      let buf: string | Buffer = cmd;
      if (cmdType == 'HEX') {
        buf = Buffer.from(hexStringToByte(cmd));
      } else {
        buf = cmd + this.parser.delimiter;
      }
      p.port.write(buf);
      console.log('send cmd: ', buf);
    }
  }

  clearBuffer() {
    this.databuffer = [];
  }
}
