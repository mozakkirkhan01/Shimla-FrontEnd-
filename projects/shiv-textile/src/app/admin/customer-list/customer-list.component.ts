import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  employeeDetail: any;
  SellList: any[];
  dataLoading: boolean = false;
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  constructor(
    private service: AppService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getSellList();
    this.employeeDetail = this.localService.getEmployeeDetail();
  }

  getSellList() {
   
    this.dataLoading = true;
    this.service.getSellList({}).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.SellList = response.SellList;
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

}
