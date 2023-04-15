import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DeedHubService } from '../deedhub.service';
import { DisplayListing, DisplayLoanOffer } from '../entity';
import { convertAmount, toReadableCurrency } from '../utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lend-result',
  templateUrl: './lend-result.component.html',
  styleUrls: ['./lend-result.component.css']
})
export class LendResultComponent implements OnInit {

  listings: MatTableDataSource<DisplayListing>;
  selectedListing: DisplayListing | undefined;
  selectedLoanOffers: MatTableDataSource<DisplayLoanOffer>;
  private readonly ACTUAL_COLUMNS: string[] = ['tokenId', 'highestOfferPrincipal', 'floorPrice', 'bestOfferPrice', 'valuation'];
  private readonly LTV_COLUMNS: string[] = ['tokenId', 'highestOfferPrincipalLtv', 'floorPriceLtv', 'bestOfferPriceLtv', 'valuationLtv'];
  displayColumns: string[];

  constructor(private deedHubService: DeedHubService,
              private route: ActivatedRoute) {
    this.listings = new MatTableDataSource<DisplayListing>([]);
    this.selectedListing = undefined;
    this.selectedLoanOffers = new MatTableDataSource<DisplayLoanOffer>([]);
    this.displayColumns = this.ACTUAL_COLUMNS;
  }

  changeDisplayColumn(isLtv: boolean) {
    this.displayColumns = isLtv ? this.LTV_COLUMNS : this.ACTUAL_COLUMNS;
  }

  @ViewChild(MatSort) sort?: MatSort;
  selectListing(row: DisplayListing) {
    this.selectedListing = row;
    this.selectedLoanOffers = new MatTableDataSource<DisplayLoanOffer>(row.loanOffers);
    if (this.sort) {
      this.selectedLoanOffers.sort = this.sort;
    }
  }

  ngOnInit(): void {
    const slug: string | null = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.deedHubService.getListingsBySlug(slug).subscribe(listings => {
        this.listings = new MatTableDataSource<DisplayListing>(listings.map(listing => ({
          tokenId: listing.tokenId,
          imageUrl: listing.imageUrl,
          loanPlatform: listing.loanPlatform,
          highestOfferPrincipal: listing.highestOfferPrincipal ? convertAmount(listing.highestOfferPrincipal, 'WETH') : undefined,
          floorPrice: listing.floorPrice ? convertAmount(listing.floorPrice) : undefined,
          valuation: listing.valuation ? convertAmount(listing.valuation) : undefined,
          bestOfferPrice: listing.bestOfferPrice ? convertAmount(listing.bestOfferPrice, 'WETH') : undefined,
          highestOfferPrincipalLtv: listing.highestOfferPrincipal && listing.floorPrice ? +(convertAmount(listing.highestOfferPrincipal, 'WETH') * 100 / convertAmount(listing.floorPrice)).toFixed(2) : undefined,
          floorPriceLtv: listing.floorPrice ? 100 : undefined,
          valuationLtv: listing.valuation && listing.floorPrice ? +(convertAmount(listing.valuation) * 100 / convertAmount(listing.floorPrice)).toFixed(2) : undefined,
          bestOfferPriceLtv: listing.bestOfferPrice && listing.floorPrice ? +(convertAmount(listing.bestOfferPrice, 'WETH') * 100 / convertAmount(listing.floorPrice)).toFixed(2) : undefined,
          loanOffers: listing.loanOffers.map(loanOffer => {
            console.log(loanOffer);
            return {
              lender: loanOffer.lender.substring(2, 8),
              lenderUrl: `https://etherscan.io/address/${loanOffer.lender}`,
              currency: toReadableCurrency(loanOffer.currency),
              duration: Number(loanOffer.duration),
              principal: convertAmount(loanOffer.principal, loanOffer.currency) || 0,
              apr: +((convertAmount(loanOffer.repayment, loanOffer.currency) - convertAmount(loanOffer.principal, loanOffer.currency)) * Number(loanOffer.duration) * 100 / 365).toFixed(2)
            };
          })
        })));
        if (this.sort) {
          this.listings.sort = this.sort;

        }
        //console.log(listings);
        //console.log(this.listings);
      });
    }
  }
}
