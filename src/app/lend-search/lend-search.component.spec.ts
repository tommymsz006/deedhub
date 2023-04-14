import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LendSearchComponent } from './lend-search.component';

describe('LendSearchComponent', () => {
  let component: LendSearchComponent;
  let fixture: ComponentFixture<LendSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LendSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LendSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
