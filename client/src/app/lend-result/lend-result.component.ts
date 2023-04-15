import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DeedHubService } from '../deedhub.service';
import { DisplayListing } from '../entity';
import { convertAmount } from '../utils';

@Component({
  selector: 'app-lend-result',
  templateUrl: './lend-result.component.html',
  styleUrls: ['./lend-result.component.css']
})
export class LendResultComponent implements OnInit {

  listings: MatTableDataSource<DisplayListing>;

  constructor(private deedHubService: DeedHubService) {
    this.listings = new MatTableDataSource<DisplayListing>([]);
  }

  @ViewChild(MatSort) sort?: MatSort;
  ngOnInit(): void {
    this.deedHubService.getListingsByCollection().subscribe(listings => {
      this.listings = new MatTableDataSource<DisplayListing>(listings.map(listing => ({
        tokenId: listing.tokenId,
        imageUrl: listing.imageUrl,
        loanPlatform: listing.loanPlatform,
        highestOfferPrincipal: listing.highestOfferPrincipal ? convertAmount(listing.highestOfferPrincipal, 'WETH') : undefined,
        floorPrice: listing.floorPrice ? convertAmount(listing.floorPrice) : undefined,
        valuation: listing.valuation ? convertAmount(listing.valuation) : undefined
      })));
      if (this.sort) {
        this.listings.sort = this.sort;
      }
      //console.log(listings);
      //console.log(this.listings);
    });
  }
}
