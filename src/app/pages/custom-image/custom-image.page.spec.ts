import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomImagePage } from './custom-image.page';

describe('CustomImagePage', () => {
  let component: CustomImagePage;
  let fixture: ComponentFixture<CustomImagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomImagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
