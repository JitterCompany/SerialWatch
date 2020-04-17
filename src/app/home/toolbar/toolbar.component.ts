import { Component, OnInit } from '@angular/core';
import { SerialService, SerialPortDesc } from '../../core/services/serial.service';
import { Observable } from 'rxjs';
import { SettingsService } from '../../core/services/settings.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'sw-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  serialPorts$: Observable<SerialPortDesc[]>;
  selectedDevice: SerialPortDesc;

  delimiterOptions = [
    // {label:"None", value: "", key:0},
    {label: "\\n", value: "\n", key:1},
    {label:"\\r\\n", value: "\r\n", key:2}
  ];

  delimiter = "\n";

  baudrateOptions = [
    9600,
    38400,
    115200,
    500000,
  ];
  baudrate = 115200;

  search(event) {
    console.log('search event', event);
    this.baudrateOptions = [...this.baudrateOptions]
  }

  constructor(
    private serialService: SerialService,
    private settings: SettingsService
  ) { }

  ngOnInit(): void {
    this.serialPorts$ = this.serialService.getSerialPorts();

    this.settings.isReady().pipe(first()).subscribe(() => {
      this.baudrate = this.settings.getBaudRate();
      this.delimiter = this.settings.getDelimiter();
    });
  }

  connect() {
    if (this.selectedDevice) {
      this.serialService.connect(this.selectedDevice);
    }
  }

  disconnect() {
    if (this.selectedDevice) {
      this.serialService.disconnect(this.selectedDevice);
    }
  }

  updateBaudrate(event) {
    this.settings.saveBaudRate(+this.baudrate);
  }

  updateDelimiter(event) {
    this.settings.saveNewlineChar(this.delimiter)
  }

  clear() {
    this.serialService.clearBuffer();
  }

}
