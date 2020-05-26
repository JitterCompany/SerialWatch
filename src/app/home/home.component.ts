import { Component, OnInit, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Point } from '@arction/lcjs';
import { DispatchService } from '../core/services/dispatch.service';

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
    private dispatchService: DispatchService,
    private zone: NgZone
  ) { }

  private terminalStream$ = new Subject<string>();

  ngOnInit(): void {

    this.dispatchService.subscribePlugin('terminal', this.terminalStream$);

    this.terminalStream$.subscribe(lines => {
      this.lines = this.lines.concat(lines);
    });

  }

  toggleShowPlot(show: boolean) {
    this.showPlot = show;
  }

}
