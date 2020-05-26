import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SerialService, SerialPortDesc } from '../../core/services/serial.service';
import { Observable } from 'rxjs';
import { SettingsService } from '../../core/services/settings.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DispatchService } from '../../core/services/dispatch.service';

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

  _showPlot = false;
  @Output() showPlot = new EventEmitter<boolean>();

  search(event) {
    console.log('search event', event);
    this.baudrateOptions = [...this.baudrateOptions]
  }

  constructor(
    private serialService: SerialService,
    private dispatchService: DispatchService,
    private settings: SettingsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.serialPorts$ = this.serialService.getSerialPorts();

    this.reset();

    this.serialService.connected$.subscribe(() => this.reset());

    this.settings.isReady().pipe(first()).subscribe(() => {
      this.baudrate = this.settings.getBaudRate();
      this.delimiter = this.settings.getDelimiter();
    });
  }

  reset() {
    this.serialService.getSerialPorts().pipe(first()).subscribe(ports => {
      this.selectedDevice = ports.find(p => p.connected);
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

  refresh() {
    this.serialService.refreshList();
  }

  openSettings() {
    this.router.navigate(['settings']);
  }

  togglePlot() {
    this._showPlot = !this._showPlot;
    this.showPlot.emit(this._showPlot);
  }
}
