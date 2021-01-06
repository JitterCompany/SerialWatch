import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { SerialUnit } from '../../../core/services/plugin.service';

@Component({
  selector: 'sw-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss']
})
export class LineComponent implements OnInit {

  @Input() line: SerialUnit;

  text: string;
  color: string;

  constructor() { }

  ngOnInit(): void {
    this.color = this.line.rule.color || 'white';
    this.text = this.line.line;
  }

}
