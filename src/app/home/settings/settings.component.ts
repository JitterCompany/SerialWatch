import { Component, OnInit, ComponentFactoryResolver, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, PrefixColor, MatchRule, Preferences } from '../../core/services/settings.service';
import { first } from 'rxjs/operators';
import { PluginService, Plugin } from '../../core/services/plugin.service';

@Component({
  selector: 'sw-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  color;
  prefixColors: PrefixColor[] = [];
  plugins: Plugin[] = [];

  rules: MatchRule[] = [
    {
      enabled: true,
      template: '*',
      color: '#249638',
      destinations: {
        'terminal': true,
      },
    },
    {
      enabled: true,
      template: 'plot',
      color: '#240638',
      destinations: {
        'terminal': false,
        'plot': true
      },
    }
  ];

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

  addPrefix() {
    this.prefixColors.push({prefix: 'prefix', color: '#FF00FF'})
  }

}
