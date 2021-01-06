import { Injectable } from '@angular/core';
import { Subject, timer } from 'rxjs';

import * as CSV from 'csv-string';
import { SerialUnit } from '../../core/services/plugin.service';

@Injectable({
  providedIn: 'root'
})
export class PlotService {

  stream$ = new Subject<SerialUnit>();

  index = 0;
  series = [];

  clear$ = new Subject<null>();

  public hasNew = false;


  constructor() {
    this.stream$.subscribe(s => {
      let values = CSV.parse(s.line)[0];

      for (let i=0; i< values.length; i++) {
        if (!this.series[i]) {
          this.series.push([])
        }
        this.series[i].push({
          x: this.index,
          y: Number(values[i])
        });
      }
      this.hasNew = true;
    })

    if (!this.series[0]) {
      this.series.push([])
      this.series.push([])
    }

    timer(1000, 100).subscribe(() => {
      for (let i=0; i < 50; i++) {
        this.series[0].push({
          x: this.index,
          y: Math.cos(this.index * 0.002) * 320
        });

        this.series[1].push({
          x: this.index,
          y: Math.sin(this.index * 0.002) * 320
        });
        this.index++;
      }
      this.hasNew = true;
    });
  }

  getSeries() {
    this.hasNew = false;
    return this.series;
  }

  csv(line: string) {
    let values = CSV.parse(line)[0];

    let parsed = values.map(v => ({
      x: this.index,
      y: Number(v)
    }));

    this.index += 1;

    return parsed;

    // return values.map(v => Number(v));
  }

  clearPlot() {
    this.clear$.next();

    this.series = [];
    this.index = 0;
    if (!this.series[0]) {
      this.series.push([])
      this.series.push([])
    }
  }
}
