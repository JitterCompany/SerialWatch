import { Component, OnInit } from '@angular/core';
import { TerminalService } from './terminal.service';

@Component({
  selector: 'sw-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  lines: string[] = [];

  constructor(
    private terminalService: TerminalService
  ) { }

  ngOnInit(): void {
    this.terminalService.stream$.subscribe(lines => {
      this.lines = this.lines.concat(lines);
    });
  }

}
