import { Component, OnInit } from '@angular/core';
import { SerialUnit } from '../../core/services/plugin.service';
import { TerminalService } from './terminal.service';

@Component({
  selector: 'sw-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  lines: SerialUnit[] = [];

  constructor(
    private terminalService: TerminalService
  ) { }

  ngOnInit(): void {
    this.terminalService.stream$.subscribe(s => {
      this.lines = this.lines.concat(s);
    });


    this.terminalService.clear$.subscribe(() => this.clear())
  }

  clear() {
    this.lines = [];
  }

}
