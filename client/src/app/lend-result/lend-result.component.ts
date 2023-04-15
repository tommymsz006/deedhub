import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DeedHubService } from '../deedhub.service';
import { Offer } from '../entity';
import { convertAmount } from '../utils';

@Component({
  selector: 'app-lend-result',
  templateUrl: './lend-result.component.html',
  styleUrls: ['./lend-result.component.css']
})
export class LendResultComponent implements OnInit {

  offers: MatTableDataSource<Offer>;

  constructor(private deedHubService: DeedHubService) {
    this.offers = new MatTableDataSource<Offer>([]);
  }

  @ViewChild(MatSort) sort?: MatSort;
  ngOnInit(): void {
    this.deedHubService.getOffersByCollection().subscribe(offers => {
      this.offers = new MatTableDataSource(offers.map(offer => ({
        contract: offer.contract,
        tokenId: offer.tokenId,
        currency: offer.currency,
        duration: offer.duration,
        principal: offer.principal ? convertAmount(offer.currency, offer.principal) : undefined,
        repayment: offer.repayment ? convertAmount(offer.currency, offer.repayment) : undefined,

      })));
      if (this.sort) {
        this.offers.sort = this.sort;
      }
      console.log(offers);
    });
  }
}
