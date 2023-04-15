export interface CollectionMetadata {
  traits: any
}

export interface Offer {
  contract: string,
  tokenId: string,
  currency: string | undefined,
  duration: string | undefined,
  principal: string | undefined,
  repayment: string | undefined
}
