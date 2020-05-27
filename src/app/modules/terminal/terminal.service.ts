import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  stream$ = new Subject<string>();
  clear$ = new Subject<null>();

  constructor() { }

  clearTerminal() {
    this.clear$.next();
  }
}
