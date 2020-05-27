import { NgModule, Self } from '@angular/core';

import { TextOutputComponent } from './text-output/text-output.component';
import { CommandBarComponent } from './command-bar/command-bar.component';
import { LineComponent } from './line/line.component';
import { TerminalComponent } from './terminal.component';
import { KeyboardShortcutsModule, KeyboardShortcutsHelpService } from 'ng-keyboard-shortcuts';
import { SharedModule } from '../../shared/shared.module';
import { PluginService, Plugin } from '../../core/services/plugin.service';

import { TerminalService } from './terminal.service';

@NgModule({
  declarations: [
    TextOutputComponent,
    CommandBarComponent,
    LineComponent,
    TerminalComponent,
  ],
  imports: [
    SharedModule,
    KeyboardShortcutsModule.forRoot(),
  ],
  exports: [
    TerminalComponent
  ],
  providers: [
    TerminalService,
    KeyboardShortcutsHelpService,
  ]
})
export class TerminalModule implements Plugin {

  name = "terminal";
  stream$ = this.terminalService.stream$;
  defaultTemplate = '.*';
  order = 100;

  constructor(
    private pluginService: PluginService,
    private terminalService: TerminalService
  ) {
    console.log( "TerminalModule constructor." );
    this.pluginService.registerPlugin(this);
	}
}
