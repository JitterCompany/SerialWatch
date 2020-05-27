import { Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { SerialService } from '../../../core/services/serial.service';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent, AllowIn } from "ng-keyboard-shortcuts";
import { DispatchService } from '../../../core/services/dispatch.service';
import { TerminalService } from '../terminal.service';

@Component({
  selector: 'sw-command-bar',
  templateUrl: './command-bar.component.html',
  styleUrls: ['./command-bar.component.scss']
})
export class CommandBarComponent implements OnInit, AfterViewInit {

  @ViewChild(KeyboardShortcutsComponent) private keyboard: KeyboardShortcutsComponent;

  shortcuts: ShortcutInput[] = [];

  ngAfterViewInit() {
    this.shortcuts.push({
      key: "ctrl + l",
      label: "Clear",
      description: "Clear text output on screen",
      preventDefault: true,
      allowIn: [AllowIn.Input],
      command: (output: ShortcutEventOutput) => this.clear(),
    },
    {
      key: "up",
      label: "Arrow Up",
      description: "Previous command",
      preventDefault: true,
      allowIn: [AllowIn.Input],
      command: (output: ShortcutEventOutput) => console.log("up", output),
    });

    this.keyboard.select("cmd + f").subscribe(e => console.log(e));

  }

  cmdForm: FormGroup;

  inputMethod = 'ASCII';
  inputOptions = [
    {label: 'ASCII', value: 'ASCII'},
    {label: 'HEX', value: 'HEX'},
  ];
  constructor(
    private fb: FormBuilder,
    private serialService: SerialService,
    private terminalSerivce: TerminalService
  ) { }

  ngOnInit() {
    this.cmdForm = this.fb.group({
      cmd: ['', Validators.required]
    });
  }

  sendCMD() {
    this.serialService.sendCommand(this.cmdForm.value.cmd, this.inputMethod);
  }

  clear() {
    this.terminalSerivce.clearTerminal();
  }
}
