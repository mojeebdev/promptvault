/**
 * Publish the PromptVault Move contract using the @mysten/sui SDK.
 * 
 * This allows publishing without needing the full `sui` CLI for the publish step
 * (you still need to compile the package once to get the bytecode).
 * 
 * Recommended workflow (no local CLI install):
 * 1. Open the repo in Gitpod or GitHub Codespaces (browser-based terminal).
 * 2. In the terminal, install Sui CLI: `curl -fLSs https://sui.io/install.sh | sh`
 * 3. cd contracts && sui client publish --gas-budget 100000000 --json > ../publish-result.json
 * 4. Copy the package ID from the result.
 * 5. Use the bytecode files from build/ to run this script with your private key.
 * 
 * Usage (after building):
 * npx tsx scripts/publish-contract.ts --private-key YOUR_PRIVATE_KEY_HEX
 * 
 * Or set PRIVATE_KEY env var.
 */

// @ts-nocheck  -- loose types for script, not part of app build

import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64 } from '@mysten/sui/utils';

const MAINNET_RPC = process.env.NEXT_PUBLIC_SUI_MAINNET_RPC || 'https://sui-mainnet.gateway.tatum.io';

async function main() {
  const args = process.argv.slice(2);
  let privateKey = process.env.PRIVATE_KEY || process.env.DEMO_SUI_PRIVATE_KEY;

  // Allow passing --private-key 0x...
  const pkArg = args.find((a, i) => a === '--private-key' && args[i + 1]);
  if (pkArg) {
    privateKey = args[args.indexOf('--private-key') + 1];
  }

  if (!privateKey) {
    console.error('Please provide a private key via --private-key or PRIVATE_KEY env var (hex, with or without 0x prefix).');
    process.exit(1);
  }

  // Clean the key
  const cleanKey = privateKey.replace(/^0x/, '');
  if (cleanKey.length !== 64) {
    console.error('Private key must be 32 bytes (64 hex characters).');
    process.exit(1);
  }

  const secretKey = new Uint8Array(Buffer.from(cleanKey, 'hex'));
  const keypair = Ed25519Keypair.fromSecretKey(secretKey);

  const client = new SuiClient({ url: MAINNET_RPC });

  // === IMPORTANT ===
  // You must first build the package to get the modules and dependencies.
  // The build output is usually in contracts/build/PromptVault/bytecode_modules/
  // For a full publish, you also need the dependency package IDs (from the build or previous publishes).
  //
  // For this example, we assume you have:
  // - modules: array of base64 encoded .mv files
  // - dependencies: array of package IDs (as strings, e.g. the stdlib and others from the build manifest)
  //
  // To get them easily:
  // - Build in Codespace: sui client publish will give you the info, or look in build/
  // - Or use `sui client publish --dry-run` to inspect.

  console.log('This script is a template. You need to provide the compiled modules and dependencies.');
  console.log('See comments in the file for how to obtain them from a build.');

  // Example placeholders - replace with real data from your build
  const modulesBase64: string[] = []; // e.g. fs.readFileSync('contracts/build/.../module.mv').toString('base64')
  const dependencies: string[] = []; // e.g. ['0x1', '0x2', ...] from the published dependencies

  if (modulesBase64.length === 0) {
    console.log('\n=== How to get the data ===');
    console.log('1. Build the package (in Gitpod/Codespaces):');
    console.log('   cd contracts');
    console.log('   sui client publish --gas-budget 100000000 --json');
    console.log('2. The output JSON will contain the packageId and you can extract modules from the build folder.');
    console.log('3. For dependencies, check the build output or use known mainnet package IDs for Move stdlib etc.');
    console.log('\nOnce you have the modules (as base64) and dependencies, edit this script or pass them.');
    process.exit(0);
  }

  const tx = new Transaction();

  // Publish the package
  // modulesBase64 should be an array of base64-encoded module bytes (strings)
  const [upgradeCap] = tx.publish({
    modules: modulesBase64,
    dependencies,
  });

  // Usually you transfer the upgrade cap to yourself
  tx.transferObjects([upgradeCap], tx.pure.address(keypair.getPublicKey().toSuiAddress()));

  console.log('Signing and executing publish transaction...');

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('Publish result:', JSON.stringify(result, null, 2));

  const packageId = result.objectChanges?.find(
    (c: any) => c.type === 'published'
  )?.packageId;

  if (packageId) {
    console.log('\n✅ Package published successfully!');
    console.log(`Package ID: ${packageId}`);
    console.log('Set this in your .env.local:');
    console.log(`NEXT_PUBLIC_PROMPTVAULT_PACKAGE_ID=${packageId}`);
  }
}

main().catch(console.error);