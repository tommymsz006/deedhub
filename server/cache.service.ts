import * as Fs from 'fs';

import { Listing } from './entity';

export class CacheService {

  private _listings: {[key: string]: Listing[]};

  constructor(listingFile: string) {
    this._listings = {};

    console.log(`Reading cache at ${listingFile}...`);
    this._listings = JSON.parse(Fs.readFileSync(listingFile, 'utf8'));
    let listingCount: number = 0;
    for (const assetContract of Object.keys(this._listings)) {
      listingCount += this._listings[assetContract].length;
    }
    console.log(`${listingCount} listing(s) loaded across ${Object.keys(this._listings).length} collection(s)`);
  }

  getAllAssetContracts(): string[] {
    return Object.keys(this._listings);
  }

  async getListingsByCollection(assetContract: string): Promise<Listing[]> {
    return this._listings[assetContract];
  }
}