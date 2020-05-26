import { Injectable } from '@angular/core';

import { from, BehaviorSubject, timer, Subject, Observable, Subscription } from 'rxjs';
import { map, bufferTime } from 'rxjs/operators';

import {streamToRx} from 'rxjs-stream';

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

  public connected$ = new Subject();
  private availablePorts$ = new BehaviorSubject<SerialPortDesc[]>([]);

  private connectedDevice: SerialPortDesc;
  private subscription: Subscription;

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

      added.forEach(dev => {
        if (this.connectedDevice && this.connectedDevice.equals(dev)) {
          this.connect(dev);
        }
      });

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
    return [];//this.stream$;
    // return this.databuffer;
  }

  refreshList() {
    this.availablePorts$.next([]);
    if (this.connectedDevice && !this.connectedDevice.available) {
      this.connectedDevice = null;
    }
    this.updatePortsList();
    this.connected$.next();
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
        // this.stream$ = streamToRx(this.connectedDevice.port)
        if (this.subscription) {
          this.subscription.unsubscribe();
          this.subscription = null;
        }
        this.subscription = streamToRx<string>(this.parser).subscribe({
          next: (val) => this.parseAndDispatch(val),
          error: (err) => console.error("error in text stream: ", err)
        })


        // this.stream$.subscribe(x => console.log('stream:', x));
        this.connected$.next();
      },
      close: () => {
        console.log('[close] event for ', device.path);
      }
    });
  }

  plugins = new Map<string, Subject<string>>();

  subscribePlugin(name: string, stream: Subject<string>) {
    this.plugins.set(name, stream);
  }

  parseAndDispatch(line: string) {
    this.plugins.forEach((stream, name) => {
      stream.next(line);
    });
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

}
