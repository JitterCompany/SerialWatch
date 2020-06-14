import { Component, OnInit } from '@angular/core';
import { Point } from '@arction/lcjs';
import { PlotService } from './plot.service';
import { timer } from 'rxjs';

@Component({
  selector: 'sw-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})

export class PlotComponent implements OnInit {

  points: Point[];
  index = 0;

  maxPoints = 1000;

  series = [];

  plotFrameworks = [{label: "LigthningChartJS", value: "light"}, {label:"Webgl-plot", value: 'webgl'}];
  plotFramework = "light"

  constructor(
    private plotService: PlotService
  ) {}

  ngOnInit() {
    this.plotService.stream$.subscribe(line => {
      this.points = this.plotService.csv(line);
      // console.log('values', values);
      // this.lines = this.lines.concat(lines);
    });

    timer(40, 40).subscribe(() => {
      if (this.plotService.hasNew) {
        this.series = [...this.plotService.getSeries()];
      }
    })
  }

  clear() {
    this.plotService.clearPlot();
  }
}