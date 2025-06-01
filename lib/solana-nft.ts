// import path from 'path'
import bs58 from 'bs58'
// import * as fs from 'fs/promises'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api'
import {
  //  createTree,
  mplBubblegum,
} from '@metaplex-foundation/mpl-bubblegum'
import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata'
import {
  // createGenericFile,
  percentAmount,
  generateSigner,
  keypairIdentity,
  // publicKey,
  createSignerFromKeypair,
  signerIdentity,
} from '@metaplex-foundation/umi'

// Helper to get UMI instance with the minter's private key
export const getUmi = (privateKey: string) => {
  const umi = createUmi(process.env.SOLANA_RPC_URL!, {
    wsEndpoint: process.env.SOLANA_WS_URL!,
    commitment: 'confirmed',
  })
    .use(
      irysUploader({
        address: 'https://devnet.irys.xyz',
      }),
    )
    .use(mplTokenMetadata())
    .use(mplBubblegum())
    .use(dasApi())

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(bs58.decode(privateKey)),
  )

  const signer = createSignerFromKeypair(umi, keypair)

  umi.use(keypairIdentity(signer))
  umi.use(signerIdentity(signer))

  return umi
}

export async function setupCollectionAndTree() {
  if (!process.env.MINT_PRIVATE_KEY) {
    throw new Error('MINTER_PRIVATE_KEY not set in .env.local')
  }
  if (!process.env.SOLANA_RPC_URL) {
    throw new Error('SOLANA_RPC_URL not set in .env.local')
  }

  const umi = getUmi(process.env.MINT_PRIVATE_KEY)
  const payerKeypair = umi.identity

  console.log(`\n--- Starting Initial Setup ---`)
  console.log(`Payer wallet for setup: ${payerKeypair.publicKey.toString()}`)

  // Certificate metadata details
  // const CERTIFICATE_NAME = 'Solana Dev Completion Certificate'
  // const CERTIFICATE_SYMBOL = 'SDCC'
  // const CERTIFICATE_DESCRIPTION =
  //   "This NFT certifies the successful completion of the 'Solana Development Mastery' course."
  // const CERTIFICATE_IMAGE_PATH = path.resolve(
  //   process.cwd(),
  //   'public',
  //   'icon.jpeg',
  // )

  // 1. Upload Certificate Image and Metadata to Arweave
  // console.log('\n1. Uploading certificate image...')
  // let imageUrl: string
  // try {
  //   const imageBuffer = await fs.readFile(CERTIFICATE_IMAGE_PATH)
  //   const imageFile = createGenericFile(imageBuffer, 'icon.jpeg', {
  //     contentType: 'image/jpeg',
  //   })
  //   ;[imageUrl] = await umi.uploader.upload([imageFile])
  //   console.log(`   Certificate Image URL: ${imageUrl}`)
  // } catch (error) {
  //   console.error(`   Error uploading image: ${error}`)
  //   throw new Error(
  //     "Failed to upload certificate image. Ensure 'public/icon.jpeg' exists.",
  //   )
  // }

  // const metadata = {
  //   name: CERTIFICATE_NAME,
  //   symbol: CERTIFICATE_SYMBOL,
  //   description: CERTIFICATE_DESCRIPTION,
  //   image: imageUrl,
  //   attributes: [
  //     { trait_type: 'Issuer', value: 'Your Solana Academy' },
  //     { trait_type: 'Course', value: 'Solana Development Mastery' },
  //   ],
  //   properties: {
  //     files: [{ uri: imageUrl, type: 'image/jpeg' }],
  //     category: 'image',
  //     creators: [{ address: payerKeypair.publicKey.toString(), share: 100 }],
  //   },
  //   external_url: 'https://degenlingo.live', // Replace with your actual website URL
  // }
  // console.log('\n2. Uploading certificate metadata JSON...')
  // let metadataUri: string
  // try {
  //   metadataUri = await umi.uploader.uploadJson(metadata)
  //   console.log(`   Certificate Metadata URI: ${metadataUri}`)
  // } catch (error) {
  //   console.error(`   Error uploading metadata JSON: ${error}`)
  //   throw new Error('Failed to upload certificate metadata JSON.')
  // }

  // 1. Uploading certificate image...
  // Certificate Image URL: https://gateway.irys.xyz/GHV77SDuhjD5ca9i8ZNCswphDLqsvaGEC8CsbEE25LLd

  // 2. Uploading certificate metadata JSON...
  // Certificate Metadata URI: https://gateway.irys.xyz/DrrN8bx6dNJ8BhiYaqLsbRyZYrUERK71EZm1CZFrD1ia
  const metadataUri = `https://gateway.irys.xyz/DrrN8bx6dNJ8BhiYaqLsbRyZYrUERK71EZm1CZFrD1ia`

  // 3. Create Merkle Tree
  // The minter wallet (umi.identity) will be the tree authority and delegate
  // const merkleTree = generateSigner(umi)

  // const maxDepth = 14 // Max depth of the tree (2^14 = 16384 NFTs)
  // const maxBufferSize = 64 // How many leaves can be updated concurrently

  // console.log(
  //   `\n3. Creating Merkle Tree with maxDepth ${maxDepth} and maxBufferSize ${maxBufferSize}...`,
  // )
  // try {
  //   const createTreeTx = await createTree(umi, {
  //     merkleTree,
  //     maxDepth,
  //     maxBufferSize,

  //     treeCreator: umi.identity, // Payer of the transaction
  //     payer: umi.identity,
  //   })

  //   const createTreeSignature = await createTreeTx.sendAndConfirm(umi)

  //   console.log('Create Tree Transaction', createTreeTx)
  //   console.log('Create Tree Signature', createTreeSignature)
  //   console.log(`   Merkle Tree created: ${merkleTree.publicKey.toString()}`)
  //   console.log(
  //     `   Create Tree Tx: https://explorer.solana.com/tx/${bs58.encode(createTreeSignature.signature)}?cluster=devnet`,
  //   )
  // } catch (error) {
  //   console.error(`   Error creating Merkle Tree: ${error}`)
  //   throw new Error(
  //     'Failed to create Merkle Tree. Ensure your minter wallet has enough SOL.',
  //   )
  // }

  // 4. Create a Collection NFT for the certificates
  // This provides a "parent" NFT that all certificates belong to.

  const collectionMint = generateSigner(umi)
  // const collectionMint = publicKey(
  //   '8TQDoQuFCbdZRg1RWnSNcCf5z5YeqaSoYxx8HkasxpxY',
  // )
  // console.log(`\n4. Creating Collection NFT: ${collectionMint.toString()}`)

  // umi.use(signerIdentity(collectionMint))

  try {
    await createNft(umi, {
      mint: collectionMint,
      name: 'DegenLingo Collection',
      symbol: 'DLCC',
      uri: metadataUri, // Use the same metadata for the collection if desired, or a separate one
      sellerFeeBasisPoints: percentAmount(0),
      updateAuthority: umi.identity,
      isCollection: true,
      isMutable: true, // Keep mutable if you might update collection metadata later
    }).sendAndConfirm(umi)
    console.log(
      `   Collection NFT created: ${collectionMint.publicKey.toString()}`,
    )

    //collectionPublickey = HioEzptSd524Z9xFkGVv1YCgG5UqxXaHxmUyu7H6GNV8
  } catch (error) {
    console.error(`   Error creating Collection NFT: ${error}`)
    throw new Error(
      'Failed to create Collection NFT. Ensure your minter wallet has enough SOL.',
    )
  }

  console.log(`\n--- Setup Complete! ---`)
  console.log(
    `\nIMPORTANT: Copy these values and paste them into 'app/actions.ts':`,
  )
  // console.log(
  //   `MERKLE_TREE_ADDRESS = new PublicKey("${merkleTree.publicKey.toString()}");`,
  // )
  console.log(
    `COLLECTION_MINT_ADDRESS = new PublicKey("${collectionMint.toString()}");`,
  )
  console.log(`CERTIFICATE_METADATA_URI = "${metadataUri}";`)
  console.log(
    `PLATFORM_FEE_RECEIVING_WALLET = new PublicKey("${payerKeypair.publicKey.toString()}"); // Your minter wallet or another treasury`,
  )

  return {
    metadataUri,
    // merkleTreeAddress: merkleTree.publicKey.toString(),
    collectionMintAddress: collectionMint.toString(),
  }
}
