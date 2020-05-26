import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {


  private databuffer: string[] = []
  private maxLines = 10000;
  public plotData$ = new BehaviorSubject<number>(0);

  constructor(
    private serialService: SerialService
  ) {
    // this.serialService
  }

  addIncomingData(data: string) {
    const K = this.databuffer.length + data.length - this.maxLines;
    this.databuffer = this.databuffer.slice(K).concat(data)

    let sensorDataPrefix = 'SensorData';
    if (data.startsWith(sensorDataPrefix)) {
      let s = '(' + data.slice(sensorDataPrefix.length + 1) + ')';
      let sensors = eval(s);
      // console.log('got sensor data:', sensors);
      this.plotData$.next(sensors.temp);
    }
  }

  clearBuffer() {
    this.databuffer = [];
  }
}
