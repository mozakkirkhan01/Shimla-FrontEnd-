import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierProductDetailComponent } from './supplier-product-detail.component';

describe('SupplierProductDetailComponent', () => {
  let component: SupplierProductDetailComponent;
  let fixture: ComponentFixture<SupplierProductDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierProductDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
