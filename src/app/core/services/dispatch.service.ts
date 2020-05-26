import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SerialService } from './serial.service';
import { bufferTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DispatchService {

  public plotData$ = new BehaviorSubject<number>(0);
  private plugins = new Map<string, Subject<string>>();

  constructor(
    private serialService: SerialService
  ) {
    let freq = 10;
    let delay_ms = 1000 / freq;
    this.serialService.textstream$.pipe(bufferTime(delay_ms)).subscribe({
      next: (line) => this.parseAndDispatch(line)
    })
  }

  subscribePlugin(name: string, stream: Subject<string>) {
    this.plugins.set(name, stream);
  }

  parseAndDispatch(lines: string[]) {
    lines.forEach(line => {
      this.plugins.forEach((stream, name) => {
        stream.next(line);
      });
    });
  }
}
