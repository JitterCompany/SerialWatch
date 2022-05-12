import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SerialUnit } from '../../core/services/plugin.service';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  stream$ = new Subject<SerialUnit>();
  clear$ = new Subject<null>();
  missed$ = new BehaviorSubject<number>(0);

  constructor() { }

  clearTerminal() {
    this.clear$.next();
  }

  missedLine() {
    if (this.missed$.value + 1 >= 10000) {
      this.missed$.next(0);
    } else {
      this.missed$.next(this.missed$.value + 1)
    }
  }
}
