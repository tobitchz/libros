import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PestaniaConfigPage } from './pestania-config.page';

describe('PestaniaConfigPage', () => {
  let component: PestaniaConfigPage;
  let fixture: ComponentFixture<PestaniaConfigPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PestaniaConfigPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
