import { Component, Input, AfterViewInit, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { lightningChart, ChartXY, Point, emptyFill } from '@arction/lcjs';
import { SerialService } from '../../core/services/serial.service';

@Component({
  selector: 'sw-plot',
  template: '<div [id]="this.chartId"></div>',
  styles: ['div { height: 100% }']
})

export class PlotComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  chart: ChartXY;
  chartId: number;

  @Input() points: Point[];
  index = 0;

  constructor(
    private serialService: SerialService
  ) {}

  ngOnInit() {

  }
  ngOnChanges() {
    // Generate random ID to us as the containerId for the chart and the target div id
    this.chartId = Math.trunc(Math.random() * 1000000);
  }

  ngAfterViewInit() {
    // Create chartXY
    this.chart = lightningChart().ChartXY({containerId: `${this.chartId}`});
    // Set chart title
    this.chart.setTitleFillStyle( emptyFill );
    // this.chart.setTitle('');
    // Add line series to the chart
    const lineSeries = this.chart.addLineSeries();
    // Set stroke style of the line
    lineSeries.setStrokeStyle((style) => style.setThickness(5));
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