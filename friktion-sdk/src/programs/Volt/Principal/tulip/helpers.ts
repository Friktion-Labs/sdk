import type * as anchor from "@friktion-labs/anchor";
import * as serumAssoToken from "@project-serum/associated-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";

export async function deriveManagementAddress(
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [programId.toBuffer(), Buffer.from("management")],
    programId
  );
}

export async function deriveVaultAddress(
  programId: PublicKey,
  farmPartOne: anchor.BN,
  farmPartTwo: anchor.BN,
  tag: Uint8Array
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from("v1"),
      farmPartOne.toArrayLike(Buffer, "le", 8),
      farmPartTwo.toArrayLike(Buffer, "le", 8),
      tag,
    ],
    programId
  );
}

export async function deriveVaultPdaAddress(
  programId: PublicKey,
  vault: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress([vault.toBuffer()], programId);
}

export async function deriveSharesMintAddress(
  programId: PublicKey,
  vault: PublicKey,
  mint: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [vault.toBuffer(), mint.toBuffer()],
    programId
  );
}

/// derives the address of a raydium vault user stake info address
export async function deriveRaydiumUserStakeInfoAddress(
  programId: PublicKey,
  vaultPda: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("info"), vaultPda.toBuffer()],
    programId
  );
}

/// derives the address of a vault withdraw queue
export async function deriveWithdrawQueueAddress(
  programId: PublicKey,
  vault: PublicKey,
  underlyingMint: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("withdrawqueue"), vault.toBuffer(), underlyingMint.toBuffer()],
    programId
  );
}

/// derives the address of a vault compound queue
export async function deriveCompoundQueueAddress(
  programId: PublicKey,
  vault: PublicKey,
  underlyingMint: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("compoundqueue"), vault.toBuffer(), underlyingMint.toBuffer()],
    programId
  );
}

export async function deriveSerumTradeAccount(
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress([Buffer.from("srm")], programId);
}

export async function deriveSerumTradePdaAddress(
  programId: PublicKey,
  tradeAccount: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [tradeAccount.toBuffer()],
    programId
  );
}

export async function deriveSerumTradeOpenOrdersAddress(
  programId: PublicKey,
  tradeAccount: PublicKey,
  serumMarket: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [tradeAccount.toBuffer(), serumMarket.toBuffer()],
    programId
  );
}

export async function deriveSerumFeeRecipientAddress(
  programId: PublicKey,
  mint: PublicKey,
  tradePda: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("serumfee"), tradePda.toBuffer(), mint.toBuffer()],
    programId
  );
}

export async function deriveTrackingAddress(
  programId: PublicKey,
  vault: PublicKey,
  owner: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("tracking"), vault.toBuffer(), owner.toBuffer()],
    programId
  );
}

export async function deriveTrackingPdaAddress(
  programId: PublicKey,
  trackingAddress: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [trackingAddress.toBuffer()],
    programId
  );
}

export async function deriveTrackingQueueAddress(
  programId: PublicKey,
  trackingPdaAddress: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("queue"), trackingPdaAddress.toBuffer()],
    programId
  );
}

export async function createAssociatedTokenAccount(
  provider: anchor.AnchorProvider, // payer
  owner: PublicKey,
  mint: PublicKey
): Promise<PublicKey> {
  const tx = new Transaction();
  tx.add(
    await serumAssoToken.createAssociatedTokenAccount(
      provider.wallet.publicKey,
      owner,
      mint
    )
  );
  await provider.sendAll([{ tx }]);
  const acct = await serumAssoToken.getAssociatedTokenAddress(owner, mint);
  return acct;
}

export async function findAssociatedStakeInfoAddress(
  poolId: PublicKey,
  walletAddress: PublicKey,
  programId: PublicKey
): Promise<PublicKey> {
  const [_associatedStakerSeed, _associatedStakerSeedNonce] =
    await PublicKey.findProgramAddress(
      [
        poolId.toBuffer(),
        walletAddress.toBuffer(),
        Buffer.from("staker_info_v2_associated_seed"),
      ],
      programId
    );
  return _associatedStakerSeed;
}

export async function deriveLendingPlatformAccountAddress(
  vaultPda: PublicKey,
  lendingMarket: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [vaultPda.toBuffer(), lendingMarket.toBuffer()],
    programId
  );
}

export async function deriveLndingPlatformInformationAccountAddress(
  vault: PublicKey,
  index: anchor.BN,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [vault.toBuffer(), index.toArrayLike(Buffer, "le", 8)],
    programId
  );
}

export async function deriveLendingPlatformConfigDataAddress(
  platformAddress: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("v1"), platformAddress.toBuffer()],
    programId
  );
}

export async function deriveMangoAccountAddress(
  vault: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [vault.toBuffer(), Buffer.from("mango")],
    programId
  );
}

export async function deriveOrcaUserFarmAddress(
  globalFarm: PublicKey,
  owner: PublicKey,
  aquaFarmProgramId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [globalFarm.toBuffer(), owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer()],
    aquaFarmProgramId
  );
}

/// derives the address of an orca double dip vault compound queue account
export async function deriveOrcaDDCompoundQueueAddress(
  programId: PublicKey,
  vault: PublicKey,
  ddFarmTokenMint: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from("ddcompoundqueue"),
      vault.toBuffer(),
      ddFarmTokenMint.toBuffer(),
    ],
    programId
  );
}

export async function deriveTrackingOrcaDDQueueAddress(
  programId: PublicKey,
  vault: PublicKey,
  trackingPda: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("ddwithdrawqueue"), trackingPda.toBuffer(), vault.toBuffer()],
    programId
  );
}

export async function deriveMultiDepositStateTransitionAddress(
  vault: PublicKey,
  progrmaId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("statetransition"), vault.toBuffer()],
    progrmaId
  );
}

export async function deriveEphemeralTrackingAddress(
  vault: PublicKey,
  owner: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("ephemeraltracking"), vault.toBuffer(), owner.toBuffer()],
    programId
  );
}

export async function deriveOrcaDDWithdrawQueueAddress(
  vault: PublicKey,
  farmTokenMint: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from("ddwithdrawqueue"),
      vault.toBuffer(),
      farmTokenMint.toBuffer(),
    ],
    programId
  );
}

export async function deriveQuarryMinerAddress(
  quarry: PublicKey,
  authority: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("Miner"), quarry.toBuffer(), authority.toBuffer()],
    programId
  );
}

export async function deriveQuarryVaultRewardTokenAccount(
  vault: PublicKey,
  // the reward token mint
  mint: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("reward"), vault.toBuffer(), mint.toBuffer()],
    programId
  );
}

export async function deriveQuarryVaultConfigDataAddress(
  vault: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("config"), vault.toBuffer()],
    programId
  );
}

export async function deriveSunnyVaultAddress(
  quarry: PublicKey,
  vaultPda: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("SunnyQuarryVault"), quarry.toBuffer(), vaultPda.toBuffer()],
    programId
  );
}

export async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function findUserFarmObligationAddress(
  authority: PublicKey,
  userFarmAddr: PublicKey,
  programId: PublicKey,
  obligationIndex: anchor.BN
): Promise<[PublicKey, number]> {
  const seeds = [
    authority.toBuffer(),
    userFarmAddr.toBuffer(),
    obligationIndex.toArrayLike(Buffer, "le", 8),
  ];
  return PublicKey.findProgramAddress(seeds, programId);
}

// finds a UserFarm account address
export async function findUserFarmAddress(
  // the user's main wallet account
  authority: PublicKey,
  // the id of the lending program
  programId: PublicKey,
  // the index of the account
  // 0 = first account, 1 = second account, etc...
  index: anchor.BN,
  // the enum of the particular farm
  // 0 = ray-usdc lp, 1 = ray-sol lp
  farm: anchor.BN
): Promise<[PublicKey, number]> {
  const seeds = [
    authority.toBuffer(),
    index.toArrayLike(Buffer, "le", 8),
    farm.toArrayLike(Buffer, "le", 8),
  ];
  return PublicKey.findProgramAddress(seeds, programId);
}

export async function findUserFArmObligationVaultAddress(
  userFarmAccount: PublicKey,
  obligationIndex: anchor.BN,
  farmProgramId: PublicKey
) {
  const seeds = [
    userFarmAccount.toBuffer(),
    obligationIndex.toArrayLike(Buffer, "le", 8),
  ];
  return PublicKey.findProgramAddress(seeds, farmProgramId);
}

export async function findUserPositionInfoAddress(
  userFarmAddress: PublicKey,
  programId: PublicKey,
  obligationIndex: anchor.BN
): Promise<[PublicKey, number]> {
  const seeds = [
    Buffer.from("position_info"),
    userFarmAddress.toBuffer(),
    obligationIndex.toArrayLike(Buffer, "le", 8),
  ];
  return PublicKey.findProgramAddress(seeds, programId);
}

export async function findVaultBalanceAccount(
  vaultInfoAccount: PublicKey,
  obligationVaultAccount: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const seeds = [
    vaultInfoAccount.toBuffer(),
    obligationVaultAccount.toBuffer(),
  ];
  return PublicKey.findProgramAddress(seeds, programId);
}

export async function findVaultBalanceMetadataAccount(
  vaultBalanceAccount: PublicKey,
  obligationVaultAccount: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const seeds = [
    vaultBalanceAccount.toBuffer(),
    obligationVaultAccount.toBuffer(),
  ];
  return PublicKey.findProgramAddress(seeds, programId);
}

export async function findVaultRewardAccount(
  vaultBalanceMetadataAccount: PublicKey,
  obligationVaultAccount: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const seeds = [
    vaultBalanceMetadataAccount.toBuffer(),
    obligationVaultAccount.toBuffer(),
  ];
  return PublicKey.findProgramAddress(seeds, programId);
}
