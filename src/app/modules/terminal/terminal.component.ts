import { Component, OnInit } from '@angular/core';
import { DispatchService } from '../../core/services/dispatch.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'sw-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  lines: string[] = [];
  private terminalStream$ = new Subject<string>();

  constructor(
    private dispatchService: DispatchService,
  ) { }

  ngOnInit(): void {
    this.dispatchService.subscribePlugin('terminal', this.terminalStream$);

    this.terminalStream$.subscribe(lines => {
      this.lines = this.lines.concat(lines);
    });
  }

}
