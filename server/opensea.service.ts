import fetch from 'node-fetch';

export class OpenSeaService {

  private _apiKey: string;
  private _assetContracts: string[];
  private _allCollectionMetadata: any;
  private _slug2AssetContract: {[key: string]: string};

  constructor(apiKey: string, assetContracts: string[]) {
    this._apiKey = apiKey;
    this._assetContracts = assetContracts;
    this._slug2AssetContract = {};
  }

  async cacheCollectionMetadata() {
    await this.getAllCollectionMetadata();  // this prepares _allCollectionMetadata
  }

  async getAllCollectionMetadata(): Promise<any> {
    let output: any = Object.freeze(this._allCollectionMetadata);
    if (!output) {
      const collectionJsonObjects: any[] = [];

      for (let assetContract of this._assetContracts) {
        const response = await fetch(`https://api.opensea.io/api/v1/asset_contract/${assetContract}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this._apiKey
          }
        });
  
        const contractData: any = await response.json();
        const slug: string = contractData?.collection?.slug;
        this._slug2AssetContract[slug] = assetContract;
        if (slug) {
          const collectionMetadata = (await this.getCollectionMetadataBySlug(slug))?.collection;
          if (collectionMetadata) {
            collectionJsonObjects.push(collectionMetadata);
          }
        }
      }

      this._allCollectionMetadata = { collections: collectionJsonObjects }; // minimic the output of https://api.opensea.io/api/v1/collections
      output = Object.freeze(this._allCollectionMetadata);
    }

    return output;    
  }

  async getCollectionMetadataBySlug(slug: string): Promise<any> {
    const response = await fetch(`https://api.opensea.io/api/v1/collection/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this._apiKey
      }
    });
    
    return response.json();
  }

  getAssetContractBySlug(slug: string): string {
    return this._slug2AssetContract[slug];
  }
}