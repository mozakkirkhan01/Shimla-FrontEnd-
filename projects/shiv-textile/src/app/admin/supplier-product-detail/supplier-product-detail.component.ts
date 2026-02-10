import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';

import * as XLSX from 'xlsx';

  let saveAs: any;
  
  import('file-saver').then((module) => {
    saveAs = module.saveAs;
  }).catch(error => {
    console.error('Failed to load file-saver:', error);
  });   
@Component({
  selector: 'app-supplier-product-detail',
  templateUrl: './supplier-product-detail.component.html',
  styleUrls: ['./supplier-product-detail.component.css']
})
export class SupplierProductDetailComponent implements OnInit {
employeeDetail: any;
  dataLoading: boolean = false;
  submitted: boolean;
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  ShopList:any = [];
  Shop: any = {};
  SupplierProductDetails: any=[];

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadDataService: LoadDataService
  ) { }

  ngOnInit(): void {
    this.getShopList();
    this.getSupplierList();
    this.getCategoryList();
    this.Shop.ShopId = "";
    this.Shop.SupplierId = "";
    this.Shop.CategoryId = "";
    this.Shop.MinAmount = "";
    this.Shop.MaxAmount = "";
    this.getSupplierProductDetails();
    this.employeeDetail = this.localService.getEmployeeDetail();
  }

  // Export To Excel 

  exportDate = new Date();
  title = 'export-excel';
  fileName: string;

  // Updated Excel Export Function for Supplier Product Details

ExportTOExcel() {
  let wsData: any[] = [];

  // Header row with filters
  let fromDate = this.Shop.FromDate ? new Date(this.Shop.FromDate).toLocaleDateString('en-GB') : '';
  let toDate = this.Shop.ToDate ? new Date(this.Shop.ToDate).toLocaleDateString('en-GB') : '';
  
  // Get selected names for display
  let selectedShopName = this.ShopList.find((shop: any) => shop.ShopId === this.Shop.ShopId)?.ShopName || '';
  let selectedSupplierName = this.SupplierList.find((supplier: any) => supplier.SupplierId === this.Shop.SupplierId)?.SupplierName || '';
  let selectedCategoryName = this.CategoryList.find((category: any) => category.CategoryId === this.Shop.CategoryId)?.CategoryName || '';

  // Add filter information to header
  wsData.push([`Export Date: ${new Date().toLocaleDateString('en-GB')}`]);
  
  if (fromDate || toDate) {
    wsData.push([`From Date: ${fromDate}`, `To Date: ${toDate}`]);
  }
  
  if (selectedShopName) {
    wsData.push([`Shop: ${selectedShopName}`]);
  }
  
  if (selectedSupplierName) {
    wsData.push([`Supplier: ${selectedSupplierName}`]);
  }
  
  if (selectedCategoryName) {
    wsData.push([`Category: ${selectedCategoryName}`]);
  }
  
  if (this.Shop.MinAmount || this.Shop.MaxAmount) {
    wsData.push([`Amount Range: ${this.Shop.MinAmount || 'Min'} - ${this.Shop.MaxAmount || 'Max'}`]);
  }

  wsData.push([]); // blank row

  // Column headers - Update these based on your actual SupplierProductDetails structure
  wsData.push([
    "#",
    "Invoice Date",
    "Invoice No",
    "Company",
    "Product",
    "StockCode",
    "Cost Price",
    "MRP",
    "P Qty",
    "A Qty"
  ]);

  // Table data
  this.SupplierProductDetails.forEach((item: any, index: number) => {
    wsData.push([
      index + 1,
      item.InvoiceDate ? new Date(item.InvoiceDate).toLocaleDateString('en-GB') : '',
      item.InvoiceNo || '',
      item.CompanyName || '',
      item.ProductName || '',
      item.StockCode || '',
      item.CostPrice || 0,
      item.MRP || 0,
      item.PurchaseQuintity  || '',
      item.AvalibleQuantity || ''
    ]);
  });

  // Calculate totals if needed
  let totalQuantity = this.SupplierProductDetails.reduce((sum: number, item: any) => sum + (item.Quantity || 0), 0);
  let totalAmount = this.SupplierProductDetails.reduce((sum: number, item: any) => sum + (item.TotalAmount || 0), 0);

  // Add totals row
  wsData.push([
    '', // empty cell for #
    '', // empty cell for Product Name
    '', // empty cell for Product Code
    '', // empty cell for Category
    'Total',
    totalQuantity,
    '', // empty cell for Unit Price
    totalAmount,
    '', // empty cell for Created Date
    ''  // empty cell for Created By
  ]);

  // Create worksheet
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);

  // Auto column width
  const colWidths = wsData[wsData.length - 2].map((_: any, i: number) => ({
    wch: Math.max(...wsData.map(row => (row[i] ? row[i].toString().length : 0))) + 2
  }));
  ws['!cols'] = colWidths;

  // Style the header row (make it bold)
  const headerRowIndex = wsData.findIndex(row => row[0] === '#');
  if (headerRowIndex !== -1) {
    for (let col = 0; col < wsData[headerRowIndex].length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      ws[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'EEEEEE' } }
      };
    }
  }

  // Create workbook and save
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Supplier Product Details');
  
  // Generate filename with current date and filters
  let fileName = `Supplier-Product-Details-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`;
  if (fromDate && toDate) {
    fileName += `-${fromDate.replace(/\//g, '-')}-to-${toDate.replace(/\//g, '-')}`;
  }
  fileName += '.xlsx';
  
  XLSX.writeFile(wb, fileName);
}


  getShopList() {
    this.dataLoading = true;
    this.service.getShopList({}).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.ShopList = response.ShopList;
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  SupplierList:any = [];
  getSupplierList() {
    this.dataLoading = true;
    this.service.getSupplierList({}).subscribe(r1 => {
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

  CategoryList:any = [];
  getCategoryList() {
    this.dataLoading = true;
    this.service.getCategoryList({}).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.CategoryList = response.CategoryList;
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  OnlyProductStockList: any[] = [];
  ProductTotal: any = {};
  getSupplierProductDetails() {
    this.ProductTotal.Quantity = 0;
    var obj = {
      ShopId: this.Shop.ShopId,
      SupplierId: this.Shop.SupplierId,
      CategoryId: this.Shop.CategoryId,
      FromDate:this.loadDataService.loadDateYMD(this.Shop.FromDate),
      ToDate: this.loadDataService.loadDateYMD(this.Shop.ToDate),
      // MinAmount: this.Shop.MinAmount,
      // MaxAmount: this.Shop.MaxAmount,
      // Search: this.Search // Add the search parameter from your input field
    };
    
    this.dataLoading = true;
    this.service.getSupplierProductDetails(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.SupplierProductDetails = response.SupplierProductDetails;
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
}

  printBadcode(form: NgForm) {
    this.submitted = true;
    if (!form.valid) {
      toastr.error("Quantity is required!!");
    }
    var id: string = this.selectedBarcode.ProductStockId + '-' + this.selectedBarcode.Quantity;
    this.service.printBarCode(id);
    $('#modal_popUp').modal('hide');
    this.selectedBarcode = {};
  }

  NewprintBarcode() {
    var id: string = this.selectedBarcode.ProductStockId + '-' + this.selectedBarcode.Quantity;

    this.service.printNewBarCode(id);
    // this.PrintList = [];
  }

  selectedBarcode: any = {};
  getProductBarcode(obj?: any) {
    this.selectedBarcode = obj;
    $('#modal_popUp').modal('show');
  }
}
