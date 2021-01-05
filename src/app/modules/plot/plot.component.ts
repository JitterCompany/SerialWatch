import { Component, OnInit } from '@angular/core';
import { Point } from '@arction/lcjs';
import { PlotService } from './plot.service';
import { timer } from 'rxjs';

import { default as TimeChart } from 'timechart';

@Component({
  selector: 'sw-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})

export class PlotComponent implements OnInit {

  points: Point[];
  index = 0;

  maxPoints = 1000;
  rendering = true;
  series = [];

  chart: TimeChart;

  plotFrameworks = [
    {label: "LigthningChartJS", value: "light"},
    // {label:"Webgl-plot", value: 'webgl'},
    {label:"Timechart", value: 'timechart'}];
  plotFramework = "timechart"

  constructor(
    private plotService: PlotService
  ) {}

  ngOnInit() {

    const el = document.getElementById('chart');
    // this.data = [];
    // for (let x = 0; x < 100; x++) {
    //     this.data.push({x, y: Math.random()});
    // }
    this.chart = new TimeChart(el, {
        series: [{
          data: this.plotService.series[0],
          lineWidth: 2,
          color: 'red',
          name: 'cos'
        },
        {
          data: this.plotService.series[1],
          lineWidth: 2,
          color: 'green',
          name: 'sin'
        }],
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

    this.plotService.stream$.subscribe(line => {
      this.points = this.plotService.csv(line);
      // console.log('values', values);
      // this.lines = this.lines.concat(lines);
    });

    timer(40, 40).subscribe(() => {
      if (this.rendering && this.plotService.hasNew) {
        this.chart.update()
        // this.series = [...this.plotService.getSeries()];
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