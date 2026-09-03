import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm } from "@angular/forms";
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LoadDataService } from '../../utils/load-data.service';
import { LocalService } from "../../utils/local.service";
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-supplier-payment-detail',
  templateUrl: './supplier-payment-detail.component.html',
  styleUrls: ['./supplier-payment-detail.component.css']
})
export class SupplierPaymentDetailComponent implements OnInit {
  Purchase: any = {};
  employeeDetail: any;
  dataLoading: boolean = false;
  submitted: boolean;
  SupplierList: any = [];
  myControl = new FormControl();
  PartyTypeList: any = [];
  SelectedSupplier: any = {};
  SupplierPaymentDetail: any = [];
  SupplierPaymentList: any = {};
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  SupplierPaymentHistory: any = [];
  SupplierGRHistory: any[] = [];
  grTotal: any = {};

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadDataService: LoadDataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  redUrl: string;
  ngOnInit(): void {
    this.resetForm();
    this.getAllSupplierList();
    this.employeeDetail = this.localService.getEmployeeDetail();
  }

  resetForm() {
    this.SelectedSupplier = {};
    this.SelectedSupplier.CompanyName = null;
    this.SelectedSupplier.ContactPersonName = null;
    this.SelectedSupplier.MobileNo = null;
    this.SelectedSupplier.GSTNo = null;
    this.SupplierPaymentHistory = [];
    this.SupplierGRHistory = [];
    this.paymentTotal = {};
    this.grTotal = {};
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  afterSupplierSelected(item: any) {
    this.Purchase.SupplierId = item.SupplierId;
    this.SelectedSupplier = item;
    this.getSupplierPaymentHistory();
    this.getSupplierGRHistory();
  }

  clearSupplier() {
    this.Purchase.SupplierId = null;
    this.SupplierPaymentHistory = [];
    this.SupplierGRHistory = [];
    this.paymentTotal = {};
    this.grTotal = {};
  }

  paymentTotal: any = {};
  getSupplierPaymentHistory() {
    this.paymentTotal.grandTotalAmount = 0;
    this.paymentTotal.grandPaidAmount = 0;
    this.paymentTotal.FinalAmount = 0;
    this.dataLoading = true;
    var obj = {
      SupplierId: this.Purchase.SupplierId
    }
    this.service.getSupplierPaymentHistory(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.SupplierPaymentHistory = response.SupplierPaymentHistory;
        this.SupplierPaymentHistory.forEach((e1: any) => {
          this.paymentTotal.grandTotalAmount += e1.TotalAmount;
          this.paymentTotal.grandPaidAmount += e1.PaidAmount;
          this.paymentTotal.FinalAmount = this.paymentTotal.grandTotalAmount - this.paymentTotal.grandPaidAmount;
        });
        this.calculateBalance();
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  // GR (Goods Return) history for the selected supplier: how much stock/amount
  // has been returned back to them.
  getSupplierGRHistory() {
    this.grTotal.TotalQuantity = 0;
    this.grTotal.TotalTaxableAmount = 0;
    this.grTotal.TotalGSTAmount = 0;
    this.grTotal.TotalAmount = 0;
    this.dataLoading = true;
    var obj = {
      SupplierId: this.Purchase.SupplierId
    }
    this.service.getSupplierGRHistory(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.SupplierGRHistory = response.SupplierGRHistory;
        this.SupplierGRHistory.forEach((e1: any) => {
          this.grTotal.TotalQuantity += e1.TotalQuantity;
          this.grTotal.TotalTaxableAmount += e1.TotalTaxableAmount;
          this.grTotal.TotalGSTAmount += e1.TotalGSTAmount;
          this.grTotal.TotalAmount += e1.TotalAmount;
        });
        this.calculateBalance();
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  // Balance Due = Total Billed - Total Paid - Total Returned (GR).
  // Safe to call after either fetch resolves, independent of order.
  calculateBalance() {
    const totalBill = this.paymentTotal.grandTotalAmount || 0;
    const totalPaid = this.paymentTotal.grandPaidAmount || 0;
    const totalReturned = this.grTotal.TotalAmount || 0;
    this.paymentTotal.BalanceAmount = totalBill - totalPaid - totalReturned;
  }

  getSupplierPaymentList() {
    this.dataLoading = true;
    var obj = {
      SupplierId: this.Purchase.SupplierId
    }
    this.service.getSupplierPaymentList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.SupplierPaymentList = response.SupplierPaymentList;
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  getSupplierPaymentDetail() {
    this.dataLoading = true;
    var obj = {
      SupplierId: this.Purchase.SupplierId
    }
    this.service.getSupplierPaymentDetail(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.SupplierPaymentDetail = response.SupplierPaymentDetail;
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  getAllSupplierList() {
    this.dataLoading = true;
    this.service.getAllSupplierList({}).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.SupplierList = response.SupplierList;
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

}