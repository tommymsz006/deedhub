import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LendResultComponent } from './lend-result.component';

describe('LendResultComponent', () => {
  let component: LendResultComponent;
  let fixture: ComponentFixture<LendResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LendResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LendResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
