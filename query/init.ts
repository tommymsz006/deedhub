import { exec } from 'child_process';
import { promisify } from 'util';
import fetch, { Response } from 'node-fetch';
import * as Fs from 'fs';

import { Listing } from './entity';

import 'dotenv/config';

const execPromise = promisify(exec);
const EXEC_MAX_BUFFER: number = 16777216;
const ASSET_CONTRACTS: string[] = [
  "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258"  // otherdeed
];
const OUTPUT_FILE: string = './listings.json';

const main = async () => {
  const nftfiCommand = `${process.env.CURL_PATH || 'curl'} -s 'https://api.nftfi.com/listings' -H 'x-paging: {"limit":4000,"skip":0,"sort":null}' -H 'x-filters: {"nftCollateralContract":["${ASSET_CONTRACTS.join("\",\"")}"]'}`;
  const nftfiData = JSON.parse((await execPromise(nftfiCommand, {maxBuffer: EXEC_MAX_BUFFER})).stdout);
  const listings: {[key: string]: Listing[]} = {};

  // Step 1: load all listings available
  let count: number = 0;
  for (const listing of nftfiData) {
    if (listing.nftCollateralContract) {
      if (listings[listing.nftCollateralContract] === undefined) {
        listings[listing.nftCollateralContract] = [];
      }
      listings[listing.nftCollateralContract].push({
        tokenId: listing.nftCollateralId,
        loanPlatform: 'NFTfi',
        desiredCurrency: listing.desiredLoanCurrency,
        desiredDuration: listing.desiredLoanDuration,
        desiredPrincipal: listing.desiredLoanPrincipalAmount,
        desiredRepayment: listing.desiredRepaymentAmount,
        highestOfferPrincipal: undefined,
        floorPrice: undefined,
        valuation: undefined,
        loanOffers: []
      });
      count++;
    }
  }
  console.log(`${count} listing(s) loaded across ${Object.keys(listings).length} collection(s)`);

  // Step 2: retrieve available offers for each listings
  for (const assetContract of Object.keys(listings)) {
    // Step 2a: get offer
    console.log('Retrieving NFTfi offer data...');
    const offerResponses: Response[] = await batchedFetch(listings[assetContract],
                                    assetContract,
                                    'https://sdk-api.nftfi.com/offers?nftAddress=${assetContract}&nftId=${listings[l].tokenId}&page=1&limit=100&sort=loanPrincipalAmount&direction=desc',
                                    {
                                      "referer": 'https://app.nftfi.com/',
                                      "x-api-key": process.env.NFTFI_API_KEY || ''
                                    },
                                    7);

    for (let i = 0; i < offerResponses.length; i++) {
      //console.log(i);
      //console.log(responses[i]);
      const data: any = await offerResponses[i].json();
      //console.log(data);
      let highestOfferPrincipal: number = 0;
      for (const result of data.results) {
        if (result.terms.loan.currency === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {    // WETH
          listings[assetContract][i].loanOffers.push({
            lender: result.lender.address,
            currency: result.terms.loan.currency,
            duration: (result.terms.loan.duration / 86400).toString(), // 86400 = 24 * 60 * 60
            principal: result.terms.loan.principal.toLocaleString('fullwide', { useGrouping: false }),
            repayment: result.terms.loan.repayment.toLocaleString('fullwide', { useGrouping: false })
          });
          highestOfferPrincipal = result.terms.loan.principal > highestOfferPrincipal ? result.terms.loan.principal : highestOfferPrincipal;
        }
      }
      listings[assetContract][i].highestOfferPrincipal = highestOfferPrincipal.toLocaleString('fullwide', { useGrouping: false });
    }

    // Step 2b: get valuation
    console.log('Retrieving NFTBank valuation data...');
    const valResponses: Response[] = await batchedFetch(listings[assetContract],
                                    assetContract,
                                    'https://api.nftbank.run/v1/nft/${assetContract}/${tokenId}/estimate',
                                    {
                                      "x-api-key": process.env.NFTBANK_API_KEY || ''
                                    },
                                    1);
    for (let i = 0; i < valResponses.length; i++) {
      const data: any = await valResponses[i].json();
      //console.log(data);
      listings[assetContract][i].floorPrice = data.data.floor.eth;
      listings[assetContract][i].valuation = data.data.estimate.eth;
    }
    console.log(JSON.stringify(listings[assetContract][0]));
  }

  // Step 3: cache data
  console.log('Caching generated data to ${OUTPUT_FILE}...');
  Fs.promises.writeFile(OUTPUT_FILE, JSON.stringify(listings), 'utf8');
}

main().catch(err => console.error(err));

async function batchedFetch(listings: Listing[], assetContract: string, url: string, headers: any, batchSize: number): Promise<Response[]> {
  let startIndex: number = 0;
  let fetchPromises: Promise<Response>[] = [];
  const responses: Response[] = [];
  while (startIndex < listings.length) {
    console.log(`Getting data in batch: ${startIndex} (${Math.floor(startIndex*100/listings.length)}%)...`);
    fetchPromises = [];
    for (let l = startIndex; l < startIndex + batchSize && l < listings.length; l++) {

      console.log(`Token: ${listings[l].tokenId}`);
      fetchPromises.push(fetch(url.replace('${assetContract}', assetContract).replace('${tokenId}', listings[l].tokenId), {
        method: 'GET',
        headers: headers
      }));
    }
    responses.push(...await Promise.all(fetchPromises));
    startIndex = responses.length;
  }
  console.log('Finished getting data in batch.')

  return responses;
}