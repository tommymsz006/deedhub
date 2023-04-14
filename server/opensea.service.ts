import fetch from 'node-fetch';

export class OpenSeaService {

  private _apiKey: string;

  constructor(apiKey: string) {
    this._apiKey = apiKey;
  }

  async getCollectionMetadata(slug: string) {
    const response = await fetch(`https://api.opensea.io/api/v1/collection/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this._apiKey
     }
    })
    
    return response.json();
  }
}