import { Component, OnInit } from '@angular/core';
import { SerialService } from '../serial.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private serialSerive: SerialService
  ) { }

  ngOnInit(): void { }

}
