# External Volt Information & Helpers

## Overview

- volt-sdk: typescript api wrapping Friktion instructions
- volt-abi: rust crate providing contexts and instruction hooks for CPI calls (anchor)
- simple-manager: basic CLI tool for interacting with volts

## (Other) Development Resources
- https://app.friktion.fi/mainnet-registry.json - JSON registry up-to-date with latest information. Useful for on-chain data. Feel free to hotlink it. This registry will be maintained through to at least December 2022
- https://github.com/Friktion-Labs/mainnet-tvl-snapshots - Historical TVL snapshots per asset, coingecko price, and deposit breakdowns. Useful for creating time-series data without needing to query the chain
- https://github.com/Friktion-Labs/external - Public Friktion SDK, published to https://www.npmjs.com/package/@friktion-labs/friktion-sdk

## MAINNET VOLTS
```
{
      "name": "BTC CALL",
      "voltVaultId": "CdZ1Mgo3927bsYdKK5rnzGtwek3NLWdvoTSSm2TJjdqW",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
      "depositTokenMint": "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
      "shareTokenMint": "3BjcHXvyzMsjmeqE2qFLx45K4XFx3JPiyRnjJiF5MAHt",
      "shareTokenSymbol": "fcBTC",
      "shareTokenDecimals": 6,
      "voltType": 1,
    },
    {
      "name": "SOL CALL",
      "voltVaultId": "CbPemKEEe7Y7YgBmYtFaZiECrVTP5sGrYzrrrviSewKY",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "So11111111111111111111111111111111111111112",
      "depositTokenMint": "So11111111111111111111111111111111111111112",
      "shareTokenMint": "4Hnh1UCC6HLzx9NaGKnTVHR2bANcRrhydumdHCnrT3i2",
      "shareTokenSymbol": "fcSOL",
      "shareTokenDecimals": 9,
      "voltType": 1,
    },
    {
      "name": "SOL CALL HIGH VOLTAGE",
      "voltVaultId": "6ESYJXX4tqSTZrTRQbHodQZEwU7jd4fKWvStBpttRB4c",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "So11111111111111111111111111111111111111112",
      "depositTokenMint": "So11111111111111111111111111111111111111112",
      "shareTokenMint": "DNa849drqW19uBV5X9ohpJ5brRGzq856gk3HDRqveFrA",
      "shareTokenSymbol": "fcSOLHigh",
      "shareTokenDecimals": 9,
      "voltType": 1,
      "isVoltage": true
    },
    {
      "name": "mSOL CALL",
      "voltVaultId": "9RcdLHX8rkfjo4ze2uyvhfQGjX6wAZtbvmBf3aK6wqrG",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      "depositTokenMint": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      "shareTokenMint": "6UA3yn28XecAHLTwoCtjfzy3WcyQj1x13bxnH8urUiKt",
      "shareTokenSymbol": "fcmSOL",
      "shareTokenDecimals": 9,
      "voltType": 1,
    },
    {
      "name": "ETH CALL",
      "voltVaultId": "A2jbvwftkAzU5hLUmBePdfqZQsop7jydZirLS5NsRVtx",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
      "depositTokenMint": "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
      "shareTokenMint": "GjnoPUjQiEUYWuKAbMax2cM1Eony8Yutc133wuSun9hS",
      "shareTokenSymbol": "fcETH",
      "shareTokenDecimals": 6,
      "voltType": 1,
    },
    {
      "name": "FTT CALL",
      "voltVaultId": "8qjBanq5cxc3FzsaEznKfpsbPwfMVoB6AxLXY7pe3fEX",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3",
      "depositTokenMint": "AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3",
      "shareTokenMint": "7wDh4VCTPwx41kvbLE6fkFgMEjnqw7NpGJvQtNabCm2B",
      "shareTokenSymbol": "fcFTT",
      "shareTokenDecimals": 6,
      "voltType": 1,
    },
    {
      "name": "SRM CALL",
      "voltVaultId": "Ef2CD9yhQE7BvReQXct68uuYFW8GLKj62u2YPfmua3JY",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
      "depositTokenMint": "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
      "shareTokenMint": "5SLqZSywodLS8ih6U2AAioZrxpgR149hR8SApmCB7r5X",
      "shareTokenSymbol": "fcSRM",
      "shareTokenDecimals": 6,
      "voltType": 1,
    },
    {
      "name": "MNGO CALL",
      "voltVaultId": "DxSADpEUR8xULRdWwb37pN8mjPHHC5D8aRnyUAvVSYHa",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
      "depositTokenMint": "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
      "shareTokenMint": "4sTuzTYfcE2NF7zy6Sy8XhVcNLa6JQSLrx3roy97n4sD",
      "shareTokenSymbol": "fcMNGO",
      "shareTokenDecimals": 6,
      "voltType": 1,
    },
    {
      "name": "scnSOL CALL",
      "voltVaultId": "3ZYabzsHY2XGuVBBbAgrxitPhmHSKLDCKqEp3vpX9Jb1",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm",
      "depositTokenMint": "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm",
      "shareTokenMint": "5VmdHqvRMbXivuC34w4Hux9zb1y9moiBEQmXDrTR1kV",
      "shareTokenSymbol": "fcscnSOL",
      "shareTokenDecimals": 9,
      "voltType": 1,
    },
    {
      "name": "SBR CALL",
      "voltVaultId": "5b2VBmdZAmnFpmWD6hi5xWFeaf4equVwNp25q1UWC9FP",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1",
      "depositTokenMint": "Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1",
      "shareTokenMint": "DPMCwE9z9jXaDVDti5aKhdgCWGgsvioz6ZvB9eZjH7UE",
      "shareTokenSymbol": "fcSBR",
      "shareTokenDecimals": 6,
      "voltType": 1,
    },
    {
      "name": "LUNA CALL",
      "voltVaultId": "4jx7Fec8kmwvabqTYp9M7C2zPfhivFgiqqzajn9Ns2ba",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W",
      "depositTokenMint": "F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W",
      "shareTokenMint": "95sn4kgeJnnBfRCD8S2quu4HS9Y6vb7JDuXrarnmEjYE",
      "shareTokenSymbol": "fcLUNA",
      "shareTokenDecimals": 6,
      "voltType": 1,
    },
    {
      "name": "RAY CALL",
      "voltVaultId": "4LtxyBUH8PsRea21s7CaaYWtq7KutcZ4x8r6PTmUCcvs",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      "depositTokenMint": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      "shareTokenMint": "SoAnGsHVqSyaN4MjWoPCcftC1V6oSeNxLJjF5TXrtuL",
      "shareTokenSymbol": "fcRAY",
      "shareTokenDecimals": 6,
      "voltType": 1,
    },
    {
      "name": "LUNA PUT",
      "voltVaultId": "3aL9h1PVt2rbUPo11QZpRbpLJhWHrHCpizsirWhMXiXB",
      "quoteMint": "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
      "underlyingMint": "F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W",
      "depositTokenMint": "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
      "shareTokenMint": "74ozhToAS71nDVBtFZMMucdkNB95tV2o5fhtFGQeixwS",
      "shareTokenSymbol": "fpLUNA",
      "shareTokenDecimals": 6,
      "voltType": 2,
    },
    {
      "name": "SOL PUT",
      "voltVaultId": "2evPXRLaTZj92DM93sdryeszwqoC9C6DoWa1TKHn1AzU",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "So11111111111111111111111111111111111111112",
      "depositTokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "shareTokenMint": "EBPM7fvPN8EuA65Uc7DT9eGyDUZ1sqMLM8Rb8y2YxBYU",
      "shareTokenSymbol": "fpSOL",
      "shareTokenDecimals": 6,
      "voltType": 2,
    },
    {
      "name": "SOL PUT HIGH VOLTAGE",
      "voltVaultId": "BTuiZkgodmKKJtNDhVQGvAzqW1fdSNWasQADDTTyoAxN",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "So11111111111111111111111111111111111111112",
      "depositTokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "shareTokenMint": "G8jsAWUA2KdDn7XmV1sBqUdbEXESaPdjPWDEYCsnkRX2",
      "shareTokenSymbol": "fpSOLHigh",
      "shareTokenDecimals": 6,
      "voltType": 2,
      "isVoltage": true
    },
    {
      "name": "MNGO PUT",
      "voltVaultId": "9SPz2yjNc9V4FmdHrkYF1GfikGbe5rfwg6VPzhQJpPyt",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
      "depositTokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "shareTokenMint": "CxHG1tPkeEHsAVmPF2UrjZK3W719J5DGFgMaLtUkBoeP",
      "shareTokenSymbol": "fpMNGO",
      "shareTokenDecimals": 6,
      "voltType": 2,
    },
    {
      "name": "BTC PUT",
      "voltVaultId": "CzFUVBXaAxWRQ3JeJwsZHqDQUxBbUJLZtdoBQ3KPtsuB",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
      "depositTokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "shareTokenMint": "THjfJ7GUeW6aMU6dzYYFVs5LnKNvmPzgk2wbh3bWagC",
      "shareTokenSymbol": "fpBTC",
      "shareTokenDecimals": 6,
      "voltType": 2,
    },
    {
      "name": "SOL PUT (tsUSDC deposit token)",
      "voltVaultId": "FFhHmdwHS9myqQPQUMTu8hX56zQETNPC4Bu95ZGb1j5P",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "So11111111111111111111111111111111111111112",
      "depositTokenMint": "Cvvh8nsKZet59nsDDo3orMa3rZnPWQhpgrMCVcRDRgip",
      "shareTokenMint": "Fw8mw9zNyfngvBYuS2L6XWfvFE8fExQ3apZVw4Ery5oy",
      "shareTokenSymbol": "fptsUSDCSOL",
      "shareTokenDecimals": 6,
      "voltType": 2,
    },
    {
      "name": "ETH PUT",
      "voltVaultId": "2QRujUdQwz5p7XNQWh48KbyZ9AMEbG7WbkuqMMS9KdE5",
      "quoteMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "underlyingMint": "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
      "depositTokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "shareTokenMint": "2uTkms42P62dJ7JRaefc1HFkvyBeMP28J6MPmH1gVHoT",
      "shareTokenSymbol": "fpETH",
      "shareTokenDecimals": 6,
      "voltType": 2,
    }
```
## Code Examples

### Deposit

#### note how we claim pending if that exists

```
const voltVaultId = new PublicKey("VOLT_VAULT_ID_HERE")
const depositTokenMintAddress: string
const depositTokenDecimals: number
const friktionSDK: FriktionSDK
// Decimal is from import Decimal from "decimal.js";
const depositAmount: Decimal
const vaultTokenAccount // load user's vaultTokenAccount using cVoltSDK.voltVault.vaultMint

const cVoltSDK = new ConnectedVoltSDK(
    connection,
    wallet.publicKey,
    await friktionSDK.loadVoltByKey(voltVaultId),
    undefined
  );
  const voltVault = cVoltSDK.voltVault;
  const connection = connection;

  try {
    let depositInstructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];
    let depositTokenAccountKey: PublicKey | null;

    try {
      pendingDepositInfo = await cVoltSDK.getPendingDepositForUser();
    } catch (err) {
      pendingDepositInfo = null;
    }

    if (
      pendingDepositInfo &&
      pendingDepositInfo.roundNumber.lt(voltVault.roundNumber) &&
      pendingDepositInfo?.numUnderlyingDeposited?.gtn(0)
    ) {
      console.log(
        "claiming pending:",
        pendingDepositInfo?.numUnderlyingDeposited.toString()
      );
      depositInstructions.push(
        await cVoltSDK.claimPending(vaultTokenAccount.pubKey)
      );
    }

    if (depositTokenMintAddress === WRAPPED_SOL_ADDRESS) {
        const rentBalance = await connection.getMinimumBalanceForRentExemption(
            AccountLayout.span
        );
        // Check if the wrapped token account already exists
        const {
            instructions: wrapSolInstructions,
            newTokenAccount: wrappedSolAccount,
        } = await initializeTokenAccountTx({
            connection: connection,
            payerKey: wallet.publicKey,
            mintPublicKey: new PublicKey(WRAPPED_SOL_ADDRESS),
            owner: wallet.publicKey,
            rentBalance: rentBalance,
            extraLamports: depositAmount.toNumber() * LAMPORTS_PER_SOL,
        });
        depositInstructions = depositInstructions.concat(wrapSolInstructions);
        signers.push(wrappedSolAccount);
        depositTokenAccountKey = wrappedSolAccount.publicKey;
    } else {
        // load depositTokenAccount using depositTokenMintAddress
        const depositTokenAccount
        depositTokenAccountKey = depositTokenAccount.pubKey;
    }

    if (!vaultTokenAccount) {
        const { tokenDest, createTokenAccountIx } =
            await createAssociatedTokenAccountInstruction(
            voltVault.vaultMint,
            wallet.publicKey
            );
        depositInstructions.push(createTokenAccountIx);
        vaultTokenDest = tokenDest;
    } else {
        vaultTokenDest = vaultTokenAccount.pubKey;
    }

    depositInstructions.push(
        await cVoltSDK.deposit(
            depositAmount,
            depositTokenAccountKey,
            vaultTokenDest,
            undefined,
            depositTokenDecimals
        )
    );

    if (depositTokenMintAddress === WRAPPED_SOL_ADDRESS) {
        const closeWSolIx = Token.createCloseAccountInstruction(
            TOKEN_PROGRAM_ID,
            depositTokenAccountKey,
            wallet.publicKey, // Send any remaining SOL to the owner
            wallet.publicKey,
            []
        );
        depositInstructions.push(closeWSolIx);
    }

    const sProvider = SolanaProvider.load({
      connection: connection,
      sendConnection: connection,
      wallet: wallet,
      opts: {
        commitment: "confirmed",
      },
    });

    const depositTx = new TransactionEnvelope(
      sProvider,
      depositInstructions,
      signers
    );
```

### Withdraw

```
const voltVaultId = new PublicKey("VOLT_VAULT_ID_HERE")
const depositTokenMintAddress: string
const depositTokenDecimals: number
const friktionSDK: FriktionSDK
// Decimal is from import Decimal from "decimal.js";
const withdrawAmount: Decimal
const depositTokenAccount // load user's depositTokenAccount
const vaultTokenAccount // load user's vaultTokenAccount using cVoltSDK.voltVault.vaultMint

const cVoltSDK = new ConnectedVoltSDK(
    providerMut.connection,
    providerMut.wallet.publicKey,
    await friktionSDK.loadVoltByKey(voltVaultId),
    undefined
  );
  const voltVault = cVoltSDK.voltVault;

  const connection = providerMut.connection;

// first we need to get this estimatedTotalUnderlyingWithoutPending

let voltWriterTokenBalance = new Decimal(0);
if (
    voltVault.writerTokenMint.toString() !==
    "11111111111111111111111111111111"
) {
    voltWriterTokenBalance = await getAccountBalanceOrZero(
    connection,
    voltVault.writerTokenMint, // publickey of the volt's writerTokenMint
    voltVault.writerTokenPool // publickey of the volt's writerTokenPool
    );
}

const voltDepositTokenBalance = await getAccountBalanceOrZero(
    connection,
    new PublicKey(depositTokenMintAddress),
    voltVault.depositPool // publickey of the volt's depositPool
);

const depositNormFactor = new Decimal(
    10 ** depositTokenDecimals
    );

let estimatedTotalUnderlyingWithoutPending = new Decimal(0);
if (
    isNotNullOrUndefined(voltWriterTokenBalance) ||
    isNotNullOrUndefined(voltDepositTokenBalance) ||
    isNotNullOrUndefined(underlyingAmountPerContract) ||
    isNotNullOrUndefined(normFactor)
) {
estimatedTotalUnderlyingWithoutPending =
voltDepositTokenBalance
      .plus(voltWriterTokenBalance.mul(new Decimal(vaultUnderlyingAmountPerContract)))
      .div(depositNormFactor)
}

// now for the actual withdraw stuff

  try {
    let withdrawInstructions: TransactionInstruction[] = [];
    const signers: Signer[] = [];

    let depositTokenDest: PublicKey | null;

    if (depositTokenMintAddress === WRAPPED_SOL_ADDRESS) {
      const rentBalance = await connection.getMinimumBalanceForRentExemption(
        AccountLayout.span
      );
      // Check if the wrapped token account already exists
      const {
        instructions: wrapSolInstructions,
        newTokenAccount: wrappedSolAccount,
      } = await initializeTokenAccountTx({
        connection: connection,
        payerKey: wallet.publicKey,
        mintPublicKey: new PublicKey(WRAPPED_SOL_ADDRESS),
        owner: wallet.publicKey,
        rentBalance: rentBalance,
      });
      withdrawInstructions = withdrawInstructions.concat(wrapSolInstructions);
      signers.push(wrappedSolAccount);
      depositTokenDest = wrappedSolAccount.publicKey;
    } else {
      if (!depositTokenAccount) {
        const { tokenDest, createTokenAccountIx } =
          await createAssociatedTokenAccountInstruction(
            new PublicKey(depositTokenMintAddress),
            wallet.publicKey
          );
        withdrawInstructions.push(createTokenAccountIx);
        depositTokenDest = tokenDest;
      } else {
        depositTokenDest = depositTokenAccount.pubKey;
      }
    }

    let pendingDepositInfo;

    try {
      pendingDepositInfo = await cVoltSDK.getPendingDepositForUser();
    } catch (err) {
      pendingDepositInfo = null;
    }

    if (!vaultTokenAccount) {
        // getOrCreateATA is from @saberhq/token-utils
        const ataResult = await getOrCreateATA({
            provider: providerMut,
            mint: voltVault.vaultMint,
            owner: wallet.publicKey,
        });
        vaultTokenAccount = ataResult.address;

        if (ataResult.instruction) {
            withdrawInstructions.push(ataResult.instruction);
        }
    }

    if (
      pendingDepositInfo &&
      pendingDepositInfo.roundNumber.lt(voltVault.roundNumber) &&
      pendingDepositInfo?.numUnderlyingDeposited?.gtn(0)
    ) {
      console.log(
        "claiming pending:",
        pendingDepositInfo?.numUnderlyingDeposited.toString()
      );
      withdrawInstructions.push(await cVoltSDK.claimPending(vaultTokenAccount));
    }

    let pendingWithdrawalInfo;

    try {
      pendingWithdrawalInfo = await cVoltSDK.getPendingWithdrawalForUser();
    } catch (err) {
      pendingWithdrawalInfo = null;
    }
    if (
      pendingWithdrawalInfo &&
      pendingWithdrawalInfo.roundNumber.lt(voltVault.roundNumber) &&
      pendingWithdrawalInfo?.numVoltRedeemed?.gtn(0)
    ) {
      console.log("adding claim pending withdrawal instruction");
      withdrawInstructions.push(
        await cVoltSDK.claimPendingWithdrawal(depositTokenDest)
      );
    }

    console.log("curr round # = ", voltVault.roundNumber.toString());
    console.log("pending deposit info =", pendingDepositInfo);
    console.log("pending withdrawal info =", pendingWithdrawalInfo);

    const roundInfo = await cVoltSDK.getRoundByKey(
        (
            await VoltSDK.findRoundInfoAddress(
                cVoltSDK.voltKey,
                cVoltSDK.voltVault.roundNumber,
                cVoltSDK.sdk.programs.Volt.programId
                )
        )[0]
    );

    const vaultMintSupply = (
        await getMintSupplyOrZero(connection, voltVault.vaultMint)
        ).add(new Decimal(roundInfo.voltTokensFromPendingWithdrawals.toString()));

    if (vaultMintSupply.equals(0)) {
        error("Withdraw error:", "Zero vault mint supply!");
        return false;
    }

    const normFactor = new Decimal(
        10 ** depositTokenDecimals
        );

    const userVoltTokenBalance = vaultTokenAccount.amount;

    let withdrawalAmountNormalized = withdrawAmount.mul(normFactor);
    let withdrawalAmountVaultTokens = withdrawalAmountNormalized
        .mul(vaultMintSupply)
        .div(estimatedTotalUnderlyingWithoutPending.mul(normFactor))
        .toFixed(0);

    console.log(
    "Real volt token price of this volt: ",
    vaultMintSupply
        .div(estimatedTotalUnderlyingWithoutPending.mul(normFactor))
        .toString()
    );

    console.log(
    "estimatedTotalUnderlyingWithoutPending of this volt: ",
    estimatedTotalUnderlyingWithoutPending.mul(normFactor).toString()
    );
    console.log(
    "withdrawal amount normalized: ",
    withdrawalAmountNormalized.toString()
    );

    /** If user's is withdrawing between 99.8-102%, we set withdrawal to 100.0% */
    if (userVoltTokenBalance) {
        const withdrawalAmountVaultTokensDec = new Decimal(
            withdrawalAmountVaultTokens
        );
        const withdrawRatio = withdrawalAmountVaultTokensDec
            .div(userVoltTokenBalance)
            .toNumber();
        if (withdrawRatio > 0.998 && withdrawRatio < 1.02) {
            console.log("Fixing withdraw to 100%. Ratio was ", withdrawRatio);
            withdrawalAmountVaultTokens = userVoltTokenBalance.toString();
        } else {
            console.log(
            "Not fixing withdraw to 100%. Ratio: ",
            withdrawalAmountVaultTokensDec.div(userVoltTokenBalance).toNumber()
            );
        }
    } else {
        console.error(
            "We dont have users volt token balance so cant fix to 100"
        );
    }

    console.log(
    "volt estimated underlying balance: ",
    estimatedTotalUnderlyingWithoutPending.toString()
    );

    console.log(
    "withdrawal amount vault tokens : ",
    withdrawalAmountVaultTokens.toString()
    );

    const withdrawIns = await cVoltSDK.withdraw(
        new BN(withdrawalAmountVaultTokens.toString()),
        vaultTokenAccount,
        depositTokenDest
    );
    withdrawInstructions.push(withdrawIns);
    }
    

    if (depositTokenMintAddress === WRAPPED_SOL_ADDRESS) {
      const closeWSolIx = Token.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID,
        depositTokenDest,
        wallet.publicKey, // Send any remaining SOL to the owner
        wallet.publicKey,
        []
      );
      withdrawInstructions.push(closeWSolIx);
    }

    const withdrawTx = new TransactionEnvelope(
      providerMut,
      withdrawInstructions,
      signers
    );
```

## License

The code in this repository original code. 

Code in this repository only contains code derived from permissively licensed open source software (such as those licensed under MIT or Apache-2.0).

Contract to facilitate deposit/withdraw vaults + any instructions required to execute relevant strategy. **Volt 1 is covered calls.**

## Management Pipeline

Initialize -> Start Round -> Set Next Option -> Rebalance Prepare -> Rebalance Enter -> Rebalance Settle -> Rebalance Swap Premium -> End Round -> Start Round -> repeat...

**All Token Transfers**

Deposit: user sends underlying / base asset (SOL). receives volt tokens. if not in transfer window, then does nothing but increments info in "round" account.

Rebalance Prepare: send SOL, receive writer token + option token

Rebalance Enter: send option token, receive quote asset (USDC)

Rebalance Settle: redeem writer token for one of (base asset = SOL), (quote asset = USDC)

Rebalance Swap Premium: send quote asset (USDC), receive base asset (SOL). we use this instruction to ensure all volt-managed assets are in base asset before starting next round

End Round: transfers underlying from "round" token account to deposit pool. mints volt tokens to "round" token account" proportional to number of pending deposits.

Claim Pending: redeems volt tokens from earlier round user deposited .

**Claim Pending** is a separate instruction used to redeem pending deposits (not required in pipeline)'

Claim Pending Withdrawal: redeems underlying tokens from earlier round user withdrew.

**Claim Pending Withdrawal** is a separate instruction used to redeem pending withdrawals (not required in pipeline)'

## User Interaction Instruction Set

### Deposit

deposits base asset tokens into volt and receives vault tokens. deposits remain pending until next round if they were made outside of the transfer window

**IF** in transfer window

##### Details:

Take as input X, where X is the # of underlying tokens deposit into the volt. Mint vault tokens to proportional to user ownership of the deposit pool (sushiX formula). Return error if overflow is encountered, user wallet has less than X underlying tokens, or any of the accounts don't match those set in Initialize.

**ELSE** not in transfer window

##### Details:

transfers underlying tokens to token accounts associated with the current round of investing. The volt tokens will later be minted proportionally in end_round and transferred to the user in ClaimPending.

### Withdraw

withdraws underlying tokens from volt and burns vault tokens

##### Details:

Take as input Y, where Y is the # of vault tokens to redeem from the volt for a proportional number of underlying tokens. Transfer underlying tokens equal to `(# withdrawn vault tokens) / (# total supply of vault tokens) * (# total deposited underlying)` to the user. Burn Y vault tokens. Return error if overflow is encountered, `user_vault_tokens` has less than Y underlying tokens, or any of the accounts don't match those set in Initialize.

### ClaimPending

Checks if there exists a pending deposit for given user. If yes, and the volt tokens have been minted for that round, transfer user's share of volt tokens to their wallet.

## Rebalancing State Instruction Set

### Initialize

Initializes state for a volt. Can only be called once on a given address.

##### Details:

Create a new mint for the vault token. Create pools for the underlying, quote, option, and writer tokens. Set account addresses and strategy metadata (e.g ul per contract, quote per contract, expiry) on VoltVault. Initialize state variables for FSM to correct values.

### StartRound

Starts a new round of rebalancing. called immediately after Initialize or EndRound

##### Details:

opens transfer window. resets booleans guarding each stage of rebalancing (e.g prepare_is_finished). opens up SetNextOption (post transfer window)

### SetNextOption

Sets the option to be traded (e.g minted and sold for covered calls). Opens up RebalancePrepare

##### Details:

Requires that StartRound was called previously. Initializes pools (token accounts) for option token and writer token. Sets option metadata on VoltVault

### RebalancePrepare

Mints options. stores option tokens and writer tokens in token account PDAs. Opens up RebalanceEnter.

##### Details:

require that SetNextOption was called previously. Mint max possible # of options (option token + writer token). Calculation is `deposit_pool.amount / underlying_amount_per_contract` for calls.

### RebalanceEnter

Enters target options position (e.g sells calls for volt 1). This only sends one order, so requires multiple calls. Opens up RebalanceSettle

##### Details:

Requires that RebalancePrepare was called previously. Create a permissioned OpenOrders account if one does not exist. Cancels all existing orders. Puts a sell order at the best bid price on serum (for covered calls).

### RebalanceSettle

Redeems writer tokens for underlying and quote. opens up RebalanceSwapPremium if enough quote asset is left in the premium pool. Else, opens up EndRound

##### Details:

Requires that RebalanceEnter was called previously, and the target option market expired. Redeem all available underlying and quote tokens from the post-expiry option market pools. If **any** quote token is received, opens up RebalanceSwapPremium to convert quote to underlying before selling options. Opens up EndRound

### RebalanceSwapPremium

Swaps premium (quote) for underlying (base). Opens up EndRound.

##### Details:

Requires that RebalanceSettle was called previously, and there was leftover premium. Opens up EndRound

### EndRound

Resets booleans for later stages. Mints volt tokens for pending deposits from the round. Open up StartRound.

