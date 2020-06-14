import { Component, OnInit, Input } from '@angular/core';
import WebGLplot, { WebglLine, ColorRGBA } from "webgl-plot";

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
  selector: 'sw-webgl-plot',
  templateUrl: './webgl-plot.component.html',
  styleUrls: ['./webgl-plot.component.scss']
})
export class WebglPlotComponent implements OnInit {

  canv;
  line;
  wglp;

  _series: WebglLine[] = [];
  // get series() { return this._series }

  private _max: number = 2000;
  get maxPoints() { return this._max }
  @Input() set maxPoints(max: number) {
    this._max = max;
    // this.chart.getDefaultAxisX().setInterval( -this.maxPoints, 0 )
  }

  @Input() set series(series: {x: number, y:number}[][]) {
    console.log('new series:', series)

    const maxY = 4096
    for (let i = 0; i < series.length; i++) {
      if (!this._series[i]) {

        const color = new ColorRGBA(0.5*Math.random(), 0.5*Math.random(), 0.5*Math.random(), 1.0);
        let newSeries = new WebglLine(color, this.numX)
        // newSeries.lineSpaceX(0, 1);
        newSeries.lineSpaceX(-1, 2 / this.numX);
        this.wglp.addLine(newSeries);
        this._series.push(newSeries);
      }

      const N = series[i].length;
      for (let j = 0; j < N; j++) {
        let point: {x: number, y:number} = series[i][j];
        // console.log('set', point.x, point.y);
        const k = Math.max(this.numX - N, 0);
        this._series[i].setY(k+point.x, point.y/maxY - 0.5);
      }

    }

    if (this.wglp) {
      this.wglp.update();
    }

  }

  numX: number;

  constructor() { }

  ngOnInit(): void {
    console.log('webgl plot')
    this.canv = document.getElementById("plot_canvas");
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.numX = Math.round(this.canv.clientWidth * devicePixelRatio);
    this.wglp = new WebGLplot(this.canv);
    // const color = new ColorRGBA(Math.random(), Math.random(), Math.random(), 1);
    // this.line = new WebglLine(color, this.numX);
    // this.line.lineSpaceX(-1, 2 / this.numX);
    // this.wglp.addLine(this.line);
    // this.update();
    this.wglp.update();
  }

  update() {
    const freq = 0.001;
    const amp = 1;
    const noise = 0.1;
    console.log('num points', this.line.numPoints)
    for (let i = 0; i < this.line.numPoints; i++) {
      const ySin = Math.sin(Math.PI * i * freq * Math.PI * 2);
      const yNoise = Math.random() - 0.5;
      this.line.setY(i, ySin * amp + yNoise * noise);
    }
  }

}
