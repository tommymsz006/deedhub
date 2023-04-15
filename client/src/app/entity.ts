export interface CollectionMetadata {
  traits: any,
  name: string,
  primary_asset_contracts: { address: string }[],
  slug: string
}

export interface Listing {
  tokenId: string,
  imageUrl: string,
  loanPlatform: string,
  desiredCurrency: string | undefined,
  desiredDuration: string | undefined,
  desiredPrincipal: string | undefined,
  desiredRepayment: string | undefined,
  highestOfferPrincipal: string | undefined,
  floorPrice: string | undefined,
  valuation: string | undefined,
  bestOfferPrice: string | undefined,
  loanOffers: LoanOffer[]
}

export interface LoanOffer {
  loanPlatform: string,
  lender: string,
  currency: string,
  duration: string,
  principal: string,
  repayment: string
}

export interface DisplayListing {
  tokenId: string,
  imageUrl: string,
  loanPlatform: string,
  desiredCurrency: string | undefined,
  desiredDuration: number | undefined,
  desiredPrincipal: number | undefined,
  desiredRepayment: number | undefined,
  desiredAPR: number,
  highestOfferPrincipal: number | undefined,
  floorPrice: number | undefined,
  valuation: number | undefined,
  bestOfferPrice: number | undefined,
  highestOfferPrincipalLtv: number | undefined,
  floorPriceLtv: number | undefined,
  valuationLtv: number | undefined,
  bestOfferPriceLtv: number | undefined,
  loanOffers: DisplayLoanOffer[]
}

export interface DisplayLoanOffer {
  loanPlatform: string,
  lender: string,
  lenderUrl: string,
  currency: string,
  duration: number,
  principal: number,
  apr: number
}