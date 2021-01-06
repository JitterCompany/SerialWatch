import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SerialUnit } from '../../core/services/plugin.service';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  stream$ = new Subject<SerialUnit>();
  clear$ = new Subject<null>();

  constructor() { }

  clearTerminal() {
    this.clear$.next();
  }
}
