import { Component, OnInit } from '@angular/core';
import { SerialService, SerialPortDesc } from '../../core/services/serial.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'sw-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  serialPorts$: Observable<SerialPortDesc[]>;
  selectedDevice: SerialPortDesc;

  newlineOptions = [
    {label:"None", value: "", key:0},
    {label: "\\n", value: "\n", key:1},
    {label:"\\r\\n", value: "\r\n", key:2}
  ];

  newline = "\n";

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
    public http: HttpClient,
    private serialService: SerialService
  ) { }

  ngOnInit(): void {
    this.serialPorts$ = this.serialService.getSerialPorts();
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

}
