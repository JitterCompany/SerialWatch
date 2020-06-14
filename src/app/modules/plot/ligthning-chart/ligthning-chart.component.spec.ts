import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LigthningChartComponent } from './ligthning-chart.component';

describe('LigthningChartComponent', () => {
  let component: LigthningChartComponent;
  let fixture: ComponentFixture<LigthningChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LigthningChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LigthningChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
