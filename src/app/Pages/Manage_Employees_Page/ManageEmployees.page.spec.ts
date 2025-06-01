import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { ManageEmployeesPage } from './ManageEmployees.page';

describe('ManageEmployeesPage', () => {
  let component: ManageEmployeesPage;
  let fixture: ComponentFixture<ManageEmployeesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageEmployeesPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageEmployeesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
