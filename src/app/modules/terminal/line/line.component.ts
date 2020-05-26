import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'sw-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss']
})
export class LineComponent implements OnInit {

  @Input() line: string;

  color: string;

  constructor(
    private settings: SettingsService
  ) { }

  ngOnInit(): void {
    this.color = this.settings.getPrefixColor(this.line) || 'white';
  }

}
