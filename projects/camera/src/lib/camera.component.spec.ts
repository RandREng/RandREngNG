import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraComponent } from './camera.component';

describe('CameraNG', () => {
  let component: CameraComponent;
  let fixture: ComponentFixture<CameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
