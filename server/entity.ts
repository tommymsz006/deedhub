export interface Listing {
  tokenId: string,
  loanPlatform: string,
  desiredCurrency: string | undefined,
  desiredDuration: string | undefined,
  desiredPrincipal: string | undefined,
  desiredRepayment: string | undefined,
  highestOfferPrincipal: string | undefined,
  floorPrice: string | undefined,
  valuation: string | undefined,
  loanOffers: LoanOffer[]
}

export interface LoanOffer {
  lender: string,
  currency: string,
  duration: string,
  principal: string,
  repayment: string
}
