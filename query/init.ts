import { exec } from 'child_process';
import { promisify } from 'util';
import fetch, { Response } from 'node-fetch';
import * as Fs from 'fs';

import { Listing } from './entity';

import 'dotenv/config';

const execPromise = promisify(exec);
const EXEC_MAX_BUFFER: number = 16777216;
const ASSET_CONTRACTS: string[] = [
  '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258',   // otherdeed
  '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',   // cryptopunks
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',   // boredapeyachtclub
  '0x60e4d786628fea6478f785a6d7e704777c86a7c6',   // mutant-ape-yacht-club
  '0xed5af388653567af2f388e6224dc7c4b3241c544',   // azuki
  '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b',   // clonex
  '0x23581767a106ae21c074b2276d25e5c3e136a68b',   // proof-moonbirds
  '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',   // doodles-official
  '0xba30e5f9bb24caa003e9f2f0497ad287fdf95623',   // bored-ape-kennel-club
  '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7',   // meebits
  '0xd774557b647330c91bf44cfeab205095f7e6c367',   // nakamigos
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
  console.log(`${count} listing(s) loaded across ${Object.keys(listings).length} collection(s)`);

  // Step 2: retrieve available offers for each listings
  for (const assetContract of Object.keys(listings)) {
    // Step 2a: get offer
    console.log(`Retrieving NFTfi offer data for ${assetContract}...`);
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
            loanPlatform: 'NFTfi',
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
    console.log(`Retrieving NFTBank valuation data for ${assetContract}...`);
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

    // Step 2c: get best offer
    console.log(`Retrieving LooksRare best offer data for ${assetContract}...`);
    for (const listing of listings[assetContract]) {
      console.log(`Token: ${listing.tokenId}`);
      const looksRareCommand = `${process.env.CURL_PATH || 'curl'} -s 'https://graphql.looksrare.org/graphql' -H 'content-type: application/json' --data-raw $'{"query":"\\\\n    query GetTokenAskBidsLastOrder($collection: Address\u0021, $tokenId: BigNumber\u0021, $bidsFilter: OrderFilterInput) {\\\\n      token(collection: $collection, tokenId: $tokenId) {\\\\n        lastOrder {\\\\n          price\\\\n          currency\\\\n        }\\\\n        asks {\\\\n          ...OrderFragment\\\\n        }\\\\n        bids(filter: $bidsFilter, pagination: { first: 1 }) {\\\\n          ...OrderFragment\\\\n        }\\\\n      }\\\\n    }\\\\n    \\\\n  fragment OrderFragment on Order {\\\\n    ...BaseOrderFragment\\\\n    ... on LooksRareOrder {\\\\n      ...LooksRareV1OrderFragment\\\\n    }\\\\n    ... on LooksRareV2Order {\\\\n      ...LooksRareV2OrderFragment\\\\n    }\\\\n    ... on OpenSeaOrder {\\\\n      ...OpenSeaOrderFragment\\\\n    }\\\\n  }\\\\n  \\\\n  fragment BaseOrderFragment on Order {\\\\n    context\\\\n    signer\\\\n    collection {\\\\n      address\\\\n    }\\\\n    price\\\\n    currency\\\\n    startTime\\\\n    endTime\\\\n    hash\\\\n    id\\\\n  }\\\\n\\\\n  \\\\n  fragment LooksRareV1OrderFragment on LooksRareOrder {\\\\n    amount\\\\n    isOrderAsk\\\\n    minPercentageToAsk\\\\n    params\\\\n    strategy\\\\n    signature\\\\n    nonce\\\\n    token {\\\\n      tokenId\\\\n    }\\\\n    isOCO\\\\n  }\\\\n\\\\n  \\\\n  fragment LooksRareV2OrderFragment on LooksRareV2Order {\\\\n    quoteType\\\\n    amounts\\\\n    orderNonce\\\\n    globalNonce\\\\n    subsetNonce\\\\n    itemIds\\\\n    strategyId\\\\n    additionalParameters\\\\n    signature\\\\n    isOCO\\\\n    collectionType\\\\n    merkleTree {\\\\n      proof {\\\\n        value\\\\n        position\\\\n      }\\\\n      root\\\\n    }\\\\n  }\\\\n\\\\n  \\\\n  fragment OpenSeaOrderFragment on OpenSeaOrder {\\\\n    nonce\\\\n    amount\\\\n    isOrderAsk\\\\n    conduitKey\\\\n    orderType\\\\n    recipients {\\\\n      amount\\\\n      recipient\\\\n      token\\\\n    }\\\\n    salt\\\\n    zone\\\\n    zoneHash\\\\n    token {\\\\n      tokenId\\\\n    }\\\\n  }\\\\n\\\\n\\\\n  ","variables":{"collection":"${assetContract}","tokenId":"${listing.tokenId}","bidsFilter":{"context":["LOOKSRARE_V2"]}}}'`;
      //console.log(looksRareCommand);
      const looksRareData = JSON.parse((await execPromise(looksRareCommand, {maxBuffer: EXEC_MAX_BUFFER})).stdout);
      //console.log(JSON.stringify(looksRareData));
      listing.bestOfferPrice = looksRareData.data?.token?.bids[0]?.price;
    }
  }

  // Step 3: cache data
  console.log(`Caching generated data to ${OUTPUT_FILE}...`);
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