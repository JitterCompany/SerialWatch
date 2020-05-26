import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  showPlot = false;

  constructor() { }

  ngOnInit(): void {

  }

  toggleShowPlot(show: boolean) {
    this.showPlot = show;
  }

}
