import { Component, OnInit, ComponentFactoryResolver, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, MatchRule, Preferences } from '../../core/services/settings.service';
import { first } from 'rxjs/operators';
import { PluginService, Plugin } from '../../core/services/plugin.service';

@Component({
  selector: 'sw-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  color;
  plugins: Plugin[] = [];

  rules: MatchRule[] = [];
  fixedRules: MatchRule[] = [];

  cols = [
    { header: 'Enable', field: 'enabled', sort: '', priority: 1 },
    { header: 'Match', field: 'template', sort: '', priority: 1 },
    { header: 'Color', field: 'color', sort: '', priority: 1 },
    { header: 'Destinations', field: 'destinations', sort: '', priority: 1 },
    { header: 'Remove', field: 'remove', sort: '', priority: 1 },
  ];

  preferences: Preferences;

  constructor(
    private router: Router,
    private settingsService: SettingsService,
    private zone: NgZone,
    private pluginService: PluginService
    ) { }

  ngOnInit(): void {
    console.log('settingscmp init');
    this.plugins = this.pluginService.plugins;

    this.settingsService.isReady().pipe(first()).subscribe((ready) => {
      console.log('ready:', ready)
      this.zone.run(() => {
        this.preferences = this.settingsService.getPreferences();
        this.rules = this.preferences.rules;
        this.fixedRules = this.settingsService.fixedRules;

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

  removeRule(index: number) {
    this.rules.splice(index, 1);
    this.saveRules();
  }

  addRule() {
    this.rules.push({
      enabled: false,
      template: '',
      color: '#FFFFFF',
      destinations: {
      },
    });
  }

  saveRules() {
    this.settingsService.saveRules(this.rules);
  }

}
