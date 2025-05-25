// import bs58 from 'bs58'
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
// import {
//   createNft,
//   fetchDigitalAsset,
//   mplTokenMetadata,
// } from '@metaplex-foundation/mpl-token-metadata'
// import {
//   generateSigner,
//   percentAmount,
//   keypairIdentity,
//   createAmount,
// } from '@metaplex-foundation/umi'

// import { clusterApiUrl } from '@solana/web3.js'
// ;(async () => {
//   try {
//     console.log('Creating Umi instance...')
//     const umi = createUmi('http://127.0.0.1:8899')

//     const keypair = umi.eddsa.createKeypairFromSecretKey(
//       bs58.decode(
//         'wNnmG97jNycF222fDokVVirxUkE4xYDnergS4gngP5jD5RxsUS5waUFCJUrbnx5RB9ckJLrTeNYcunyRRPF87TM',
//       ),
//     )

//     // await umi.rpc.airdrop(keypair.publicKey, createAmount(1, 'SOL', 9))

//     // Use keypairIdentity to set the keypair as the signer
//     const signer = keypairIdentity(keypair)
//     umi.use(signer)
//     umi.use(mplTokenMetadata())

//     console.log('Keypair loaded. Public key:', keypair.publicKey)

//     const mint = generateSigner(umi)
//     console.log('Generating new mint address...')

//     console.log('Creating NFT...')
//     const { signature } = await createNft(umi, {
//       mint: mint.publicKey,
//       name: 'My NFT',
//       // Replace this with your Arweave metadata URI
//       uri: 'https://ffaaqinzhkt4ukhbohixfliubnvpjgyedi3f2iccrq4efh3s.arweave.net/KUAIIbk6p8oo4XHRcq0U__C2r0mwQaNl0gQow4Qp9yk',
//       sellerFeeBasisPoints: percentAmount(0),
//       creators: [
//         {
//           address: keypair.publicKey,
//           share: 100,
//           verified: true,
//         },
//       ],
//     }).sendAndConfirm(umi)

//     console.log('NFT created successfully!')
//     console.log('Mint address:', mint.publicKey)
//     console.log('Transaction signature:', signature)

//     console.log('Fetching digital asset...')
//     const asset = await fetchDigitalAsset(umi, mint.publicKey)
//     console.log('Digital Asset:', asset)
//   } catch (error) {
//     console.error('Error:', error)
//     console.error('Stack trace:', error.stack)
//   }
// })()
