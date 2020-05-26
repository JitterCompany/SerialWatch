import { Component, OnInit, NgZone } from '@angular/core';
import { SerialService } from '../core/services/serial.service';
import { timer, Subject } from 'rxjs';
import { Point } from '@arction/lcjs';
import { bufferTime } from 'rxjs/operators';

@Component({
  selector: 'sw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  maxLines = 10000;
  lines: string[] = [];
  showPlot = false;

  points: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 10 }
  ];

  constructor(
    private serialService: SerialService,
    private zone: NgZone
  ) { }

  private terminalStream$ = new Subject<string>();

  ngOnInit(): void {

    this.serialService.subscribePlugin('terminal', this.terminalStream$);

    this.terminalStream$.pipe(bufferTime(100)).subscribe(lines => {
      this.lines = this.lines.concat(lines);
    });


    // timer(100, 100).subscribe(() => {
    //   this.zone.run(() => {
    //     this.lines = this.serialService.getLines()
    //   });
    // });
  }

  toggleShowPlot(show: boolean) {
    this.showPlot = show;
  }

}
