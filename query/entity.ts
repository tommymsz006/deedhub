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
