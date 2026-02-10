import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeWiseSellComponent } from './employee-wise-sell.component';

describe('EmployeeWiseSellComponent', () => {
  let component: EmployeeWiseSellComponent;
  let fixture: ComponentFixture<EmployeeWiseSellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeWiseSellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeWiseSellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
