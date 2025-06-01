import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { CasePage } from './CasePage.page';

describe('CasePage', () => {
  let component: CasePage;
  let fixture: ComponentFixture<CasePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CasePage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
