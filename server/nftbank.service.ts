import fetch from 'node-fetch';

export class NFTBankService {

  private _apiKey: string;

  constructor(apiKey: string) {
    this._apiKey = apiKey;
  }

  async getValuation(assetContract: string, tokenId: string) {
    const response = await fetch(`https://api.nftbank.run/v1/nft/${assetContract}/${tokenId}/estimate`, {
      method: 'GET',
      headers: {
        'x-api-key': this._apiKey
     }
    });
    
    return response.json();
  }
}
