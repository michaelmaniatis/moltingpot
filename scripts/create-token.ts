/**
 * CLAW Token Creation Script for Solana
 *
 * This script creates the CLAW token on Solana.
 * Run with: npx ts-node scripts/create-token.ts
 *
 * Prerequisites:
 * 1. Install Solana CLI: sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
 * 2. Create a wallet: solana-keygen new
 * 3. For devnet testing: solana airdrop 2 (get free SOL)
 * 4. Set cluster: solana config set --url devnet (or mainnet-beta for production)
 */

import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

const CLAW_CONFIG = {
  name: 'Clawcoin',
  symbol: 'CLAW',
  decimals: 9,
  totalSupply: 100_000_000,
};

// Existing mint from previous run (to resume if treasury creation failed)
const EXISTING_MINT = process.env.CLAW_TOKEN_MINT || '6e8KKM6o1hTAaQrn5QGmJjrztMHZkH5bcy8oCTFDDwUm';

async function main() {
  console.log('🦀 Creating CLAW Token on Solana...\n');

  // Determine cluster
  const cluster = process.env.SOLANA_CLUSTER || 'devnet';
  const isMainnet = cluster === 'mainnet-beta';

  if (isMainnet) {
    console.log('⚠️  WARNING: You are deploying to MAINNET!');
    console.log('    This will cost real SOL. Press Ctrl+C to cancel.\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Connect to cluster
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || clusterApiUrl(cluster as any),
    'confirmed'
  );
  console.log(`📡 Connected to ${cluster}`);

  // Load or create payer wallet
  const walletPath = process.env.SOLANA_WALLET_PATH ||
    path.join(process.env.HOME || '', '.config/solana/id.json');

  let payer: Keypair;
  if (fs.existsSync(walletPath)) {
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    payer = Keypair.fromSecretKey(new Uint8Array(walletData));
    console.log(`💳 Loaded wallet: ${payer.publicKey.toBase58()}`);
  } else {
    console.log('❌ No wallet found. Create one with: solana-keygen new');
    process.exit(1);
  }

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`💰 Wallet balance: ${balance / 1e9} SOL`);

  if (balance < 0.1 * 1e9) {
    if (!isMainnet) {
      console.log('   Getting devnet airdrop...');
      const sig = await connection.requestAirdrop(payer.publicKey, 2 * 1e9);
      await connection.confirmTransaction(sig);
      console.log('   ✅ Airdrop received!');
    } else {
      console.log('❌ Insufficient SOL balance for mainnet deployment');
      process.exit(1);
    }
  }

  const mintAuthority = payer;
  const freezeAuthority = payer; // Can freeze accounts if needed

  let mint: PublicKey;

  // Check if we should use an existing mint (resume from previous run)
  if (EXISTING_MINT) {
    console.log('\n🔄 Using existing token mint...');
    mint = new PublicKey(EXISTING_MINT);
    console.log(`✅ Token mint: ${mint.toBase58()}`);
  } else {
    // Create the token mint
    console.log('\n🔨 Creating CLAW token mint...');

    mint = await createMint(
      connection,
      payer,
      mintAuthority.publicKey,
      freezeAuthority.publicKey,
      CLAW_CONFIG.decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log(`✅ Token mint created: ${mint.toBase58()}`);
  }

  // Get mint info
  const mintInfo = await getMint(connection, mint);
  console.log(`   Decimals: ${mintInfo.decimals}`);

  // Create treasury token account
  console.log('\n🏦 Creating treasury token account...');

  const treasuryAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log(`✅ Treasury account: ${treasuryAccount.address.toBase58()}`);

  // Mint initial supply to treasury
  console.log('\n💎 Minting initial supply...');

  const totalSupplyWithDecimals = BigInt(CLAW_CONFIG.totalSupply) * BigInt(10 ** CLAW_CONFIG.decimals);

  await mintTo(
    connection,
    payer,
    mint,
    treasuryAccount.address,
    mintAuthority,
    totalSupplyWithDecimals
  );

  console.log(`✅ Minted ${CLAW_CONFIG.totalSupply.toLocaleString()} CLAW to treasury`);

  // Save configuration
  const deploymentInfo = {
    network: cluster,
    tokenName: CLAW_CONFIG.name,
    tokenSymbol: CLAW_CONFIG.symbol,
    decimals: CLAW_CONFIG.decimals,
    totalSupply: CLAW_CONFIG.totalSupply,
    mintAddress: mint.toBase58(),
    treasuryAddress: treasuryAccount.address.toBase58(),
    mintAuthority: mintAuthority.publicKey.toBase58(),
    freezeAuthority: freezeAuthority.publicKey.toBase58(),
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(process.cwd(), 'data', `claw-token-${cluster}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log('\n✅ CLAW Token deployed successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Token Name:      ${CLAW_CONFIG.name} (${CLAW_CONFIG.symbol})`);
  console.log(`   Network:         ${cluster}`);
  console.log(`   Mint Address:    ${mint.toBase58()}`);
  console.log(`   Treasury:        ${treasuryAccount.address.toBase58()}`);
  console.log(`   Total Supply:    ${CLAW_CONFIG.totalSupply.toLocaleString()} CLAW`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📄 Deployment info saved to: ${outputPath}`);
  console.log('\n🔧 Add these to your .env file:');
  console.log(`   CLAW_TOKEN_MINT=${mint.toBase58()}`);
  console.log(`   CLAW_TREASURY=${treasuryAccount.address.toBase58()}`);

  // Create token metadata (for wallets to display)
  console.log('\n📝 To register token metadata (for wallet display):');
  console.log('   Visit: https://token-creator-lac.vercel.app/ (for devnet)');
  console.log('   Or use Metaplex for mainnet deployments');
}

main().catch(console.error);
