import { Component, Input, AfterViewInit, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { lightningChart, ChartXY, Point, emptyFill, SolidFill, ColorHEX, AxisScrollStrategies, DataPatterns, LineSeries } from '@arction/lcjs';
import { PlotService } from '../plot.service';

const colors = [
  "#8cd055",
  "#844ac2",
  "#cba956",
  "#ca5494",
  "#88caaf",
  "#be543f",
  "#9799c3",
  "#54603b",
  "#4e314e"
  ];

@Component({
  selector: 'sw-ligthning-chart',
  templateUrl: './ligthning-chart.component.html',
  styleUrls: ['./ligthning-chart.component.scss']
})
export class LigthningChartComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  chart: ChartXY;
  chartId: number;

  series: LineSeries[] = [];

  private _max: number = 2000;
  get maxPoints() { return this._max }
  @Input() set maxPoints(max: number) {
    this._max = max;
    this.chart.getDefaultAxisX().setInterval( -this.maxPoints, 0 )
  }

  @Input() set points(points: Point[][]) {
    if (!points || !points.length) {
      return;
    }

    for (let i=0; i< points.length; i++) {
      if (!this.series[i]) {
        this.addSeries();
      }
      this.series[i].add(points[i]);
    }

  }
  index = 0;

  constructor(
    private plotService: PlotService
  ) {}

  ngOnInit() {
    this.plotService.clear$.subscribe(() => this.clear());
  }

  clear() {
    this.series.forEach(series => {
      series.clear();
    })
  }
  ngOnChanges() {
    // Generate random ID to us as the containerId for the chart and the target div id
    this.chartId = Math.trunc(Math.random() * 1000000);
  }

  addSeries() {
    const i = this.series.length;
    const lineSeries = this.chart.addLineSeries({
      // Specifying progressive DataPattern enables some otherwise unusable optimizations.
      dataPattern: DataPatterns.horizontalProgressive
  });
    lineSeries.setMaxPointCount(8000);
    // Set stroke style of the line
    lineSeries.setStrokeStyle((style) => style.setThickness(2).setFillStyle(new SolidFill({color: ColorHEX(colors[i])})));
    this.series.push(lineSeries);
  }

  ngAfterViewInit() {
    // Create chartXY
    this.chart = lightningChart().ChartXY({containerId: `${this.chartId}`});
    // Set chart title
    this.chart.setTitleFillStyle( emptyFill );

    const axisX = this.chart.getDefaultAxisX()
    // Scroll along with incoming data.
    .setScrollStrategy( AxisScrollStrategies.progressive )
    .setInterval( -this.maxPoints, 0 )
    // this.chart.setTitle('');
    // Add line series to the chart
    this.addSeries();
    // Add data point to the line series
    // lineSeries.add(this.points);

    // this.serialService.plotData$.subscribe((y:number) => {
    //   let p: Point = {
    //     x:this.index,
    //     y:y
    //   };
    //   this.index++;
    //   lineSeries.add(p);
    // })
  }

  ngOnDestroy() {
    // "dispose" should be called when the component is unmounted to free all the resources used by the chart
    this.chart.dispose();
  }
}
