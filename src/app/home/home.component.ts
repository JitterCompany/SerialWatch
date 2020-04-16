import { Component, OnInit, NgZone } from '@angular/core';
import { SerialService } from '../core/services/serial.service';
import { timer } from 'rxjs';

@Component({
  selector: 'sw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  maxLines = 10000;
  lines: string[] = [];

  constructor(
    private serialService: SerialService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    timer(100, 100).subscribe(() => {
      this.zone.run(() => {
        this.lines = this.serialService.getLines()
      });
    });
  }

}
