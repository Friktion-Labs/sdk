import { VoltIDLJsonRaw } from "./idls/volt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseErrorCode = (err: any) => {
  return parseErrorCodeFromMessage((err as Error).message);
};

export const parseErrorCodeFromMessage = (errorMsg: string): number => {
  console.log('message = "' + errorMsg + '"');
  const splitErrMsg: string[] | undefined = errorMsg.split(
    "custom program error: "
  );
  try {
    const errorCode = parseInt(
      splitErrMsg?.at(-1)?.trim().slice(0, -1) as string,
      10
    );
    console.log("error code parse as ", errorCode);
    return errorCode;
  } catch (err) {
    console.log(err);
    throw Error("probably invalid error message to parse code from");
  }
};

export const getReasonForErrorCode = (err: number): string | undefined => {
  if (err in AnchorLangErrorMessage) {
    return AnchorLangErrorMessage.get(err);
  } else {
    return VoltIDLJsonRaw.errors.find(
      (e: any) => e.code === parseErrorCode(err)
    )?.msg;
  }
};

export const getNameForErrorCode = (err: number): string | undefined => {
  if (err in AnchorLangErrorMessage) {
    return AnchorLangErrorMessage.get(err);
  } else {
    return VoltIDLJsonRaw.errors.find(
      (e: any) => e.code === parseErrorCode(err)
    )?.name;
  }
};

export type ErrorDetails = {
  name: string;
  code: number;
  reason?: string;
};

export class UnreconizedErrorError extends Error {}

// NOTE: can use a type that extends Error? not sure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorDetails = (err: any): ErrorDetails => {
  const code = parseErrorCode(err);
  const name = getNameForErrorCode(code);
  if (name === undefined) throw new UnreconizedErrorError("unrecognized error");
  const reason = getReasonForErrorCode(code);
  return { name, code, reason };
};

// export const VoltErrorCode = VoltIDLJsonRaw.errors;

export const TokenProgramErrorcode = {
  NotRentExempt: 0,
  InsufficientFunds: 1,
  InvalidMint: 2,
  MintMismatch: 3,
  OwnerMismatch: 4,
  // FixedSupply: 5,
  AlreadyInUse: 6,
  // InvalidNumberofProvidedSigners: 7,
  // InvalidNumberofRequiredSigners: 8,
  // UninitializedState: 9,s
  // NativeNotSupported: 10,
  // NOTE: there are more: I've excluded them.
  // NonNativeHasBalance: 11
  // InvalidInstruction: 12,
  // InvalidState: 13,
  // Overflow: 14,
};

export const TokenProgramErrorMessage = new Map([
  // Instructions.
  [
    TokenProgramErrorcode.NotRentExempt,
    "Lamport balance below rent-exempt threshold",
  ],
  [TokenProgramErrorcode.InsufficientFunds, "Insufficient funds"],
  [TokenProgramErrorcode.InvalidMint, "Invalid mint"],
  [TokenProgramErrorcode.MintMismatch, "Account not associated with this mint"],
  [TokenProgramErrorcode.OwnerMismatch, "Owner does not match"],
  [TokenProgramErrorcode.AlreadyInUse, "Already in use"],
]);

export const SystemProgramErrorCode = {
  AccountAlreadyInUse: 0,
  ResultWithNegativeLamports: 1,
  InvalidProgramId: 2,
  InvalidAccountDataLength: 3,
  MaxSeedLengthExceeded: 4,
  AddressWithSeedMismatch: 5,
  NonceNoRecentBlockhashes: 6,
  NonceBlockhashNotExpired: 7,
  NonceUnexpectedBlockhashValue: 8,
};

export const SystemProgramErrorMessage = new Map([
  // Instructions.
  [
    SystemProgramErrorCode.AccountAlreadyInUse,
    "an account with the same address already exists",
  ],
  [
    SystemProgramErrorCode.ResultWithNegativeLamports,
    "account does not have enough SOL to perform the operation",
  ],
  [
    SystemProgramErrorCode.InvalidProgramId,
    "cannot assign account to this program id",
  ],
  [
    SystemProgramErrorCode.InvalidAccountDataLength,
    "cannot allocate account data of this length",
  ],
  [
    SystemProgramErrorCode.MaxSeedLengthExceeded,
    "length of requested seed is too long",
  ],
  [
    SystemProgramErrorCode.NonceNoRecentBlockhashes,
    "advancing stored nonce requires a populated RecentBlockhashes sysvar",
  ],
  [
    SystemProgramErrorCode.NonceBlockhashNotExpired,
    "stored nonce is still in recent_blockhashes",
  ],
  [
    SystemProgramErrorCode.NonceUnexpectedBlockhashValue,
    "specified nonce does not match stored nonce",
  ],
]);

// Copy paste from https://github.com/project-serum/anchor/blob/master/ts/src/error.ts
export const AnchorLangErrorCode = {
  // Instructions.
  InstructionMissing: 100,
  InstructionFallbackNotFound: 101,
  InstructionDidNotDeserialize: 102,
  InstructionDidNotSerialize: 103,

  // IDL instructions.
  IdlInstructionStub: 120,
  IdlInstructionInvalidProgram: 121,

  // Constraints.
  ConstraintMut: 140,
  ConstraintHasOne: 141,
  ConstraintSigner: 142,
  ConstraintRaw: 143,
  ConstraintOwner: 144,
  ConstraintRentExempt: 145,
  ConstraintSeeds: 146,
  ConstraintExecutable: 147,
  ConstraintState: 148,
  ConstraintAssociated: 149,
  ConstraintAssociatedInit: 150,
  ConstraintClose: 151,
  ConstraintAddress: 152,

  // Accounts.
  AccountDiscriminatorAlreadySet: 160,
  AccountDiscriminatorNotFound: 161,
  AccountDiscriminatorMismatch: 162,
  AccountDidNotDeserialize: 163,
  AccountDidNotSerialize: 164,
  AccountNotEnoughKeys: 165,
  AccountNotMutable: 166,
  AccountNotProgramOwned: 167,
  InvalidProgramId: 168,
  InvalidProgramExecutable: 169,
  AccountNotSigner: 170,
  AccountNotSystemOwned: 171,
  AccountNotInitialized: 172,

  // State.
  StateInvalidAddress: 180,

  // Used for APIs that shouldn't be used anymore.
  Deprecated: 299,
};

const AnchorLangErrorMessage = new Map([
  // Instructions.
  [
    AnchorLangErrorCode.InstructionMissing,
    "8 byte instruction identifier not provided",
  ],
  [
    AnchorLangErrorCode.InstructionFallbackNotFound,
    "Fallback functions are not supported",
  ],
  [
    AnchorLangErrorCode.InstructionDidNotDeserialize,
    "The program could not deserialize the given instruction",
  ],
  [
    AnchorLangErrorCode.InstructionDidNotSerialize,
    "The program could not serialize the given instruction",
  ],

  // Idl instructions.
  [
    AnchorLangErrorCode.IdlInstructionStub,
    "The program was compiled without idl instructions",
  ],
  [
    AnchorLangErrorCode.IdlInstructionInvalidProgram,
    "The transaction was given an invalid program for the IDL instruction",
  ],

  // Constraints.
  [AnchorLangErrorCode.ConstraintMut, "A mut constraint was violated"],
  [AnchorLangErrorCode.ConstraintHasOne, "A has_one constraint was violated"],
  [AnchorLangErrorCode.ConstraintSigner, "A signer constraint was violated"],
  [AnchorLangErrorCode.ConstraintRaw, "A raw constraint was violated"],
  [AnchorLangErrorCode.ConstraintOwner, "An owner constraint was violated"],
  [
    AnchorLangErrorCode.ConstraintRentExempt,
    "A rent exempt constraint was violated",
  ],
  [AnchorLangErrorCode.ConstraintSeeds, "A seeds constraint was violated"],
  [
    AnchorLangErrorCode.ConstraintExecutable,
    "An executable constraint was violated",
  ],
  [AnchorLangErrorCode.ConstraintState, "A state constraint was violated"],
  [
    AnchorLangErrorCode.ConstraintAssociated,
    "An associated constraint was violated",
  ],
  [
    AnchorLangErrorCode.ConstraintAssociatedInit,
    "An associated init constraint was violated",
  ],
  [AnchorLangErrorCode.ConstraintClose, "A close constraint was violated"],
  [AnchorLangErrorCode.ConstraintAddress, "An address constraint was violated"],

  // Accounts.
  [
    AnchorLangErrorCode.AccountDiscriminatorAlreadySet,
    "The account discriminator was already set on this account",
  ],
  [
    AnchorLangErrorCode.AccountDiscriminatorNotFound,
    "No 8 byte discriminator was found on the account",
  ],
  [
    AnchorLangErrorCode.AccountDiscriminatorMismatch,
    "8 byte discriminator did not match what was expected",
  ],
  [
    AnchorLangErrorCode.AccountDidNotDeserialize,
    "Failed to deserialize the account",
  ],
  [
    AnchorLangErrorCode.AccountDidNotSerialize,
    "Failed to serialize the account",
  ],
  [
    AnchorLangErrorCode.AccountNotEnoughKeys,
    "Not enough account keys given to the instruction",
  ],
  [AnchorLangErrorCode.AccountNotMutable, "The given account is not mutable"],
  [
    AnchorLangErrorCode.AccountNotProgramOwned,
    "The given account is not owned by the executing program",
  ],
  [AnchorLangErrorCode.InvalidProgramId, "Program ID was not as expected"],
  [
    AnchorLangErrorCode.InvalidProgramExecutable,
    "Program account is not executable",
  ],
  [AnchorLangErrorCode.AccountNotSigner, "The given account did not sign"],
  [
    AnchorLangErrorCode.AccountNotSystemOwned,
    "The given account is not owned by the system program",
  ],
  [
    AnchorLangErrorCode.AccountNotInitialized,
    "The program expected this account to be already initialized",
  ],

  // State.
  [
    AnchorLangErrorCode.StateInvalidAddress,
    "The given state account does not have the correct address",
  ],

  // Misc.
  [
    AnchorLangErrorCode.Deprecated,
    "The API being used is deprecated and should no longer be used",
  ],
]);

export const checkAnchorErrorCode = (errorCodeDec: number): string | null => {
  return AnchorLangErrorMessage.get(errorCodeDec) || null;
};
