import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { SettingsService, Preferences } from '../../core/services/settings.service';
import { PluginService, Plugin, MatchRule } from '../../core/services/plugin.service';

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

  maxLines = 1000;

  cols = [
    { header: 'Enable', field: 'enabled', sort: '', priority: 1 },
    { header: 'Match', field: 'template', sort: '', priority: 1 },
    { header: 'Color', field: 'color', sort: '', priority: 1 },
    { header: 'Destinations', field: 'destinations', sort: '', priority: 1 },
    { header: 'Remove', field: 'remove', sort: '', priority: 1 },
  ];

  preferences: Preferences;

  constructor(
    private settingsService: SettingsService,
    private zone: NgZone,
    private pluginService: PluginService
    ) { }

  ngOnInit(): void {
    console.log('settingscmp init');
    this.plugins = this.pluginService.plugins;

    this.settingsService.isReady().subscribe((ready) => {
      this.zone.run(() => {
        this.preferences = this.settingsService.getPreferences();
        this.rules = this.preferences.rules;
        this.maxLines = this.preferences.maxLines || 1000;
        this.fixedRules = this.settingsService.fixedRules;
      });
    });
  }

  ngOnDestroy() {
    if (this.preferences.maxLines !== this.maxLines) {
      this.saveLines();
    }
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

  saveLines() {
    this.settingsService.saveMaxLines(this.maxLines);
  }

  saveRules() {
    this.settingsService.saveRules(this.rules);
  }

  exportFilename = "sw_settings.json"
  exportSettings() {
    this.settingsService.export(this.exportFilename);
  }

  importSettings() {
    this.settingsService.import();
  }
}
