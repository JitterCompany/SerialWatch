import { Component, OnInit, NgZone } from '@angular/core';
import { SerialService } from '../core/services/serial.service';

@Component({
  selector: 'sw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  lines: string[] = [];

  constructor(
    private serialService: SerialService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {

    this.serialService.getDataStream().subscribe(line => {
      console.log('got line:', line);
      this.lines.push(line);
      this.zone.run(() => {
        this.lines = [...this.lines];
      });
    })
  }

}
