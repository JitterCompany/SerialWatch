import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import * as CSV from 'csv-string';

@Injectable({
  providedIn: 'root'
})
export class PlotService {

  stream$ = new Subject<string>();

  index = 0;
  series = [];

  clear$ = new Subject<null>();

  public hasNew = false;


  constructor() {
    this.stream$.subscribe(line => {
      let values = CSV.parse(line)[0];

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
  }
}
