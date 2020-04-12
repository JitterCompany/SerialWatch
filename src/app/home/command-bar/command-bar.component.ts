import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { SerialService } from '../../core/services/serial.service';

@Component({
  selector: 'sw-command-bar',
  templateUrl: './command-bar.component.html',
  styleUrls: ['./command-bar.component.css']
})
export class CommandBarComponent implements OnInit {

  cmdForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private serialService: SerialService
  ) { }

  ngOnInit() {
    this.cmdForm = this.fb.group({
      cmd: ['', Validators.required]
    });
  }

  sendCMD() {
    this.serialService.sendCommand(this.cmdForm.value.cmd + '\r\n');
  }
}
