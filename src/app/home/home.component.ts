import { Component, OnInit } from '@angular/core';
import { bufferTime, filter } from 'rxjs/operators';
import { PluginService } from '../core/services/plugin.service';
import { SerialService } from '../core/services/serial.service';
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'sw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  showPlot = false;

  constructor(
    private serialService: SerialService,
    private pluginService: PluginService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    let freq = 10;
    let delay_ms = 1000 / freq;

    const match_rules = this.settingsService.getRules()

    this.serialService.textstream$.pipe(bufferTime(delay_ms), filter(x => !!x.length)).subscribe({
      next: (line) => this.pluginService.parseAndDispatch(line, match_rules)
    });
  }

  toggleShowPlot(show: boolean) {
    this.showPlot = show;
  }

}
