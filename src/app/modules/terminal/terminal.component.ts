import { Component, Input, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { SerialUnit } from '../../core/services/plugin.service';
import { SettingsService } from '../../core/services/settings.service';
import { TerminalService } from './terminal.service';

@Component({
  selector: 'sw-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  maxLines = 1000;

  lines: SerialUnit[] = [];

  constructor(
    private terminalService: TerminalService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.terminalService.stream$.subscribe(s => {
      this.lines = this.lines.concat(s);
      this.clipLines();
    });

    this.settingsService.isReady().pipe(first()).subscribe(() => {
      this.maxLines = this.settingsService.getMaxLines();
    });

    this.settingsService.maxLinesChanged.subscribe(maxLines => {
      this.maxLines = maxLines;
      // timer to prevent changed after checked angular error
      timer(10).subscribe(() => this.clipLines());
    });


    this.terminalService.clear$.subscribe(() => this.clear())
  }

  clipLines() {
    if (this.lines.length > this.maxLines) {
      this.lines = this.lines.slice(this.lines.length - this.maxLines);
    }
  }

  clear() {
    this.lines = [];
  }

}
