import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BlueprintStaticViewerComponent } from './blueprint-static-viewer.component';

describe('BlueprintStaticViewerComponent', () => {
  let component: BlueprintStaticViewerComponent;
  let fixture: ComponentFixture<BlueprintStaticViewerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlueprintStaticViewerComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BlueprintStaticViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
