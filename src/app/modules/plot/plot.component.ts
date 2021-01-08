import { Component, OnInit } from '@angular/core';
import { PlotService } from './plot.service';
import { Subscription, timer } from 'rxjs';

import { default as TimeChart } from 'timechart';
import { filter, first } from 'rxjs/operators';

@Component({
  selector: 'sw-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})

export class PlotComponent implements OnInit {

  index = 0;

  maxPoints = 1000;
  rendering = true;
  series = [];

  chart: TimeChart;

  updateSubscription: Subscription;

  constructor(
    private plotService: PlotService
  ) {}

  ngOnInit() {



    this.plotService.stream$.subscribe(line => {
      // this.points = this.plotService.csv(line);
      // console.log('values', values);
      // this.lines = this.lines.concat(lines);
    });

    timer(40, 40).pipe(filter(() => this.plotService.hasNew), first()).subscribe(() => {
        console.log("Create chart");
        this.createChart(this.plotService.getSeries());
      }
    );
  }


  createChart(series) {
    const el = document.getElementById('chart');
    // this.data = [];
    // for (let x = 0; x < 100; x++) {
    //     this.data.push({x, y: Math.random()});
    // }
    let colors = ['green', 'blue', 'red', 'yellow', 'magenta', 'white'];
    let plotseries = series.map((s, i) => {
      return {
        data: s,
        lineWidth: 2,
        color: colors[i % colors.length],
        name: `series ${i}`
      }
    });

    this.chart = new TimeChart(el, {
        series: plotseries,
        xRange: { min: 0, max: 2 * 1000 },
        realTime: true,
        zoom: {
            x: {
                autoRange: true,
                minDomainExtent: 50,
            },
            y: {
                autoRange: true,
                minDomainExtent: 1,
            }
        },
    });

    this.updateSubscription =  timer(40, 40).subscribe(() => {
      if (this.rendering) {
        this.chart.update();
      }
    })
  }

  clear() {
    this.plotService.clearPlot();
  }

  pause() {
    this.rendering = false;
  }

  resume() {
    this.rendering = true;
    // this.chart.onResize();
    this.chart.options.realTime = true;
    // this.chart.options.series
  }

  maxPointsChanged(maxPoints) {
    console.log("maxpoints: ", maxPoints);
    this.chart.options.xRange = {min: 0, max: maxPoints}
  }
}