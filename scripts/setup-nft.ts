import 'dotenv/config' // Loads environment variables from .env.local
import { setupCollectionAndTree } from '@/lib/solana-nft'

async function runSetupScript() {
  try {
    console.log(
      'Running initial setup for Solana NFT collection and Merkle Tree...',
    )
    await setupCollectionAndTree()
    console.log('\nInitial setup script finished successfully.')
    console.log(
      "Remember to update 'app/actions.ts' with the outputted addresses.",
    )
  } catch (error) {
    console.error('\nInitial setup script failed:', error)
    process.exit(1) // Exit with an error code
  }
}

runSetupScript()
