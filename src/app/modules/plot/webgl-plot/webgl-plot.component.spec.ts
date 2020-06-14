import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebglPlotComponent } from './webgl-plot.component';

describe('WebglPlotComponent', () => {
  let component: WebglPlotComponent;
  let fixture: ComponentFixture<WebglPlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebglPlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebglPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
