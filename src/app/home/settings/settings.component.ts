import { Component, OnInit, ComponentFactoryResolver, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, PrefixColor } from '../../core/services/settings.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'sw-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  color;
  prefixColors: PrefixColor[] = [];

  constructor(
    private router: Router,
    private settingsService: SettingsService,
    private zone: NgZone
    ) { }

  ngOnInit(): void {
    console.log('settingscmp init');
    this.settingsService.isReady().pipe(first()).subscribe((ready) => {
      console.log('ready:', ready)
      this.zone.run(() => {
        this.prefixColors = this.settingsService.getPrefixColors()
        console.log('colors', this.prefixColors)
      });
    });
  }

  back() {
    this.router.navigate(['home']);
  }

  toDefaults() {
    this.settingsService.toDefaults();
    this.ngOnInit();
  }

  removePrefix(index: number) {
    this.prefixColors.splice(index, 1);
    this.savePrefix();
  }

  addPrefix() {
    this.prefixColors.push({prefix: 'prefix', color: '#FF00FF'})
  }

  savePrefix() {
    this.settingsService.savePrefixColors(this.prefixColors);
  }

}
