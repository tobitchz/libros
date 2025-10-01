import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { UsuarioPage } from './usuario.page';

describe('UsuarioPage', () => {
  let component: UsuarioPage;
  let fixture: ComponentFixture<UsuarioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsuarioPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
