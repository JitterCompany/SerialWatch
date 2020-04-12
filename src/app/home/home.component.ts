import { Component, OnInit } from '@angular/core';
import { SerialService } from '../core/services/serial.service';

@Component({
  selector: 'sw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  constructor(
  ) { }

  ngOnInit(): void {
  }

}
