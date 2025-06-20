export {}

// Create a type for the roles
export type Roles = 'admin' | 'user'

export type SolWallet = {
  address: string
  chain: 'solana'
  verified: boolean
}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
      wallet?: SolWallet
    }
  }
}
