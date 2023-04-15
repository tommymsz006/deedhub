import fetch, { Response } from 'node-fetch';
import * as Fs from 'fs';

import { Listing } from './entity';

export class NFTfiService {

  private _listings: {[key: string]: Listing[]};
  private _apiKey: string;

  constructor(listingFile: string, apiKey: string) {
    this._apiKey = apiKey;

    this._listings = {};

    console.log(`Reading NFTfi listings at ${listingFile}...`);
    const listings = JSON.parse(Fs.readFileSync(listingFile, 'utf8'));
    let count: number = 0;
    for (const listing of listings) {
      if (listing.nftCollateralContract) {
        if (this._listings[listing.nftCollateralContract] === undefined) {
          this._listings[listing.nftCollateralContract] = [];
        }
        this._listings[listing.nftCollateralContract].push({
          tokenId: listing.nftCollateralId,
          imageUrl: listing.imageUrl,
          loanPlatform: 'NFTfi',
          desiredCurrency: listing.desiredLoanCurrency,
          desiredDuration: listing.desiredLoanDuration,
          desiredPrincipal: listing.desiredLoanPrincipalAmount,
          desiredRepayment: listing.desiredRepaymentAmount,
          highestOfferPrincipal: undefined,
          floorPrice: undefined,
          valuation: undefined,
          bestOfferPrice: undefined,
          loanOffers: []
        });
        count++;
      }
    }
    console.log(`${count} listing(s) loaded across ${Object.keys(this._listings).length} collection(s)`);
  }

  async getListingsByCollection(assetContract: string): Promise<Listing[]> {
    const listings: Listing[] = this._listings[assetContract];
    let startIndex: number = 0;
    let fetchPromises: Promise<Response>[] = [];
    const responses: Response[] = [];
    const BATCH_SIZE: number = 10;
    while (startIndex < listings.length) {
      console.log(`Getting NFTfi data: ${startIndex} (${Math.floor(startIndex*100/listings.length)}%)...`);
      fetchPromises = [];
      for (let l = startIndex; l < startIndex + BATCH_SIZE && l < listings.length; l++) {

        console.log(`Token: ${listings[l].tokenId}`);
        fetchPromises.push(fetch(`https://sdk-api.nftfi.com/offers?nftAddress=${assetContract}&nftId=${listings[l].tokenId}&page=1&limit=100&sort=loanPrincipalAmount&direction=desc`, {
          method: 'GET',
          headers: {
            "referer": 'https://app.nftfi.com/',
            "x-api-key": this._apiKey
        }
        }));
      }
      responses.push(...await Promise.all(fetchPromises));
      startIndex = responses.length;
    }
    console.log(`NFTfi data retrieval has completed.`);

    for (let i = 0; i < responses.length; i++) {
      //console.log(i);
      //console.log(responses[i]);
      const data = await responses[i].json();
      //console.log(data);
      let highestOfferPrincipal: number = 0;
      for (const result of data.results) {
        listings[i].loanOffers.push({
          lender: result.lender.address,
          currency: result.terms.loan.currency,
          duration: (result.terms.loan.duration / 86400).toString(), // 86400 = 24 * 60 * 60
          principal: result.terms.loan.principal.toLocaleString('fullwide', { useGrouping: false }),
          repayment: result.terms.loan.repayment.toLocaleString('fullwide', { useGrouping: false })
        });
        highestOfferPrincipal = result.terms.loan.principal > highestOfferPrincipal ? result.terms.loan.principal : highestOfferPrincipal;
      }
      listings[i].highestOfferPrincipal = highestOfferPrincipal.toLocaleString('fullwide', { useGrouping: false });
    }
    return listings;
  }

  /*
  async getOffersByCollection(contract: string) {
    const response = await fetch('https://api.nftfi.com/listings', {
      method: 'GET',
      headers: {
        "x-filters": `{\"nftCollateralContract\":[\"${contract}\"]}`,
        "x-paging": "{\"limit\":50,\"skip\":0,\"sort\":null}"
     }
    });

    console.log(response);
    
    const data: Array<any> = await response.json() as Array<any>;
    console.log(data);
    return data.map(listing => ({
      contract: listing.nftCollateralContract,
      tokenId: listing.nftCollateralId,
      currency: listing.desiredLoanCurrency,
      duration: listing.desiredLoanDuration,
      principal: listing.desiredLoanPrincipalAmount,
      repayment: listing.desiredRepaymentAmount
    }));
  }
  */
}