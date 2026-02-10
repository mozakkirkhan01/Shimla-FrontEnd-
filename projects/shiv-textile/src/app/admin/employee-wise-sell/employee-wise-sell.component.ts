import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
declare var toastr: any;
declare var $: any;

import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { LocalService } from '../../utils/local.service';

@Component({
  selector: 'app-employee-wise-sell',
  templateUrl: './employee-wise-sell.component.html',
  styleUrls: ['./employee-wise-sell.component.css'],
})
export class EmployeeWiseSellComponent implements OnInit {
  employeeDetail: any;
  SellDaybookReport: any[];
  dataLoading: boolean = false;
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  dailysell: any = {};
  SalesMan: any = {};
  submitted: boolean;

  // Properties for detailed report
  reportData: any = null;
  showDetailedReport: boolean = false;
  selectedTab: string = 'summary'; 

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadDataService: LoadDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employeeDetail = this.localService.getEmployeeDetail();
    this.dailysell.FromDate = this.loadDataService.loadDateYMD(new Date());
    this.dailysell.ToDate = this.loadDataService.loadDateYMD(new Date());
    this.getShopList();
    this.getEmployeeList();
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  clearEmployee() {
    this.SalesMan.EmployeeId = '';
  }

  @ViewChild('table1') table: ElementRef;
  @ViewChild('summaryTable') summaryTable: ElementRef;
  @ViewChild('detailsTable') detailsTable: ElementRef;
  @ViewChild('productsTable') productsTable: ElementRef;
  @ViewChild('dailyTable') dailyTable: ElementRef;
  @ViewChild('categoryTable') categoryTable: ElementRef;
  @ViewChild('selltypeTable') selltypeTable: ElementRef;
  @ViewChild('directProductsTable') directProductsTable: ElementRef;

  isExporting: boolean = false;
  exportToExcel() {
    this.isExporting = true;
    var itemPerPage = this.itemPerPage;
    var p = this.p;
    this.p = 1;
    
    if (this.showDetailedReport && this.reportData) {
      this.itemPerPage = this.getActiveTabData()?.length || 100;
    } else {
      this.itemPerPage = this.SellDaybookReport?.length || 100;
    }
    
    setTimeout(() => {
      const tableRef = this.getActiveTableRef();
      this.loadDataService.exportToExcel(
        tableRef,
        'Sales_Report_' + this.loadDataService.loadDateTime(new Date())
      );
      this.itemPerPage = itemPerPage;
      this.p = p;
      this.isExporting = false;
    }, 1000);
  }

  getActiveTableRef(): ElementRef {
    if (!this.showDetailedReport) return this.table;
    
    switch(this.selectedTab) {
      case 'details': return this.detailsTable;
      case 'products': return this.productsTable;
      case 'daily': return this.dailyTable;
      case 'category': return this.categoryTable;
      case 'selltype': return this.selltypeTable;
      case 'directproducts': return this.directProductsTable;
      case 'summary':
      default: return this.summaryTable;
    }
  }

  getActiveTabData(): any[] {
    if (!this.reportData) return [];
    
    switch(this.selectedTab) {
      case 'details': return this.reportData.SellDetails || [];
      case 'products': return this.reportData.ProductWiseSales || [];
      case 'daily': return this.reportData.DailyWiseSales || [];
      case 'category': return this.reportData.CategoryWiseSales || [];
      case 'selltype': return this.reportData.SellTypeBreakdown || [];
      case 'directproducts': return this.reportData.DirectSellProductDetails || [];
      default: return [];
    }
  }

  getEmployeeId(item: any) {
    this.SalesMan.EmployeeId = item.EmployeeId;
  }

  Sell: any = {};
  SellChargeList: any[] = [];
  SellProductList: any[] = [];
  getSellDetail(SellModel: any) {
    this.dataLoading = true;
    this.service.getSellDetail(SellModel).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.Sell = response.Sell;
          this.SellChargeList = response.SellChargeList;
          this.SellProductList = response.SellProductList;
          $('#modal_popUp').modal('show');
        } else {
          toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  EmployeeList: any[] = [];
  getEmployeeList(ShopId?: number) {
    this.dataLoading = true;
    var data = {
      Status: 1,
      ShopId: ShopId ? ShopId : null
    };
    this.service.getEmployeeList(data).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.EmployeeList = response.EmployeeList;
        } else {
          toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  ShopList: any = [];
  getShopList() {
    this.dataLoading = true;
    this.service.getShopList({}).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.ShopList = response.ShopList;
        } else {
          toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  selectShopAddress() {
    for (let i = 0; i < this.ShopList.length; i++) {
      const e = this.ShopList[i];
      if (e.ShopId == this.SalesMan.ShopId) {
        this.SalesMan.Address = e.Address;
        this.SalesMan.ShopId = e.ShopId;
        this.getEmployeeList(this.SalesMan.ShopId);
        break;
      } else {
        this.SalesMan.Address = '';
      }
    }
  }

  SellTotal: any = {};

  // UNIFIED EMPLOYEE SALES REPORT METHOD
  // getEmployeeSalesReport() {
  //   if (!this.SalesMan.ShopId ) {
  //     toastr.error('Please select Shop');
  //     return;
  //   }

  //   this.dataLoading = true;
  //   this.reportData = null;

  //   var obj = {
  //     FromDate: this.loadDataService.loadDateYMD(this.dailysell.FromDate),
  //     ToDate: this.loadDataService.loadDateYMD(this.dailysell.ToDate),
  //     ShopId: this.SalesMan.ShopId,
  //     EmployeeId: this.SalesMan.EmployeeId
  //   };

  //   this.service.getUnifiedEmployeeSalesReport(obj).subscribe(
  //     (r1) => {
  //       let response = r1 as any;
  //       if (response.Message == ConstantData.SuccessMessage) {
  //         this.reportData = response.Data;
  //         console.log('Unified Report Data:', this.reportData);
          
  //         this.showDetailedReport = true;
  //         this.selectedTab = 'summary';
  //         toastr.success('Unified report loaded successfully');
  //       } else {
  //         toastr.error(response.Message);
  //         console.log(response);
  //         this.showDetailedReport = false;
  //       }
  //       this.dataLoading = false;
  //     },
  //     (err) => {
  //       toastr.error('Error Occured while fetching data.');
  //       this.dataLoading = false;
  //       this.showDetailedReport = false;
  //     }
  //   );
  // }

  switchTab(tab: string) {
    this.selectedTab = tab;
    this.p = 1; // Reset pagination
  }

  backToBasicReport() {
    this.showDetailedReport = false;
    this.reportData = null;
    this.selectedTab = 'summary';
  }

  printInvoice(id: any) {
    this.service.printSellInvoice(id);
  }

  printReport() {
    window.print();
  }





  // Add new properties
shopWiseReport: any = null;
showShopWiseReport: boolean = false;

// Modify the getEmployeeSalesReport method
getEmployeeSalesReport() {
  if (!this.SalesMan.ShopId) {
    toastr.error('Please select Shop');
    return;
  }

  this.dataLoading = true;
  this.reportData = null;
  this.shopWiseReport = null;
  this.showDetailedReport = false;
  this.showShopWiseReport = false;

  var obj = {
    FromDate: this.loadDataService.loadDateYMD(this.dailysell.FromDate),
    ToDate: this.loadDataService.loadDateYMD(this.dailysell.ToDate),
    ShopId: this.SalesMan.ShopId,
    EmployeeId: this.SalesMan.EmployeeId || 0
  };

  // If no employee selected, get shop-wise grouped report
  if (!this.SalesMan.EmployeeId) {
    this.service.getShopWiseEmployeeSalesReport(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.shopWiseReport = response.Data;
          console.log('Shop-wise Report Data:', this.shopWiseReport);
          this.showShopWiseReport = true;
          toastr.success('Shop-wise employee report loaded successfully');
        } else {
          toastr.error(response.Message);
          this.showShopWiseReport = false;
        }
        this.dataLoading = false;
      },
      (err) => {
        toastr.error('Error occurred while fetching data.');
        this.dataLoading = false;
        this.showShopWiseReport = false;
      }
    );
  } else {
    // Existing single employee report logic
    this.service.getUnifiedEmployeeSalesReport(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.reportData = response.Data;
          console.log('Unified Report Data:', this.reportData);
          this.showDetailedReport = true;
          this.selectedTab = 'summary';
          toastr.success('Unified report loaded successfully');
        } else {
          toastr.error(response.Message);
          this.showDetailedReport = false;
        }
        this.dataLoading = false;
      },
      (err) => {
        toastr.error('Error occurred while fetching data.');
        this.dataLoading = false;
        this.showDetailedReport = false;
      }
    );
  }
}

// Add method to view individual employee details
viewEmployeeDetails(employeeId: number) {
  this.SalesMan.EmployeeId = employeeId;
  this.getEmployeeSalesReport();
}
}