import { LitPKPResource } from "@lit-protocol/auth-helpers";
import {
  AuthMethodScope,
  AuthMethodType,
  LIT_NETWORK,
  ProviderType,
} from "@lit-protocol/constants";
import {
  BaseProvider,
  GoogleProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  AuthMethod,
  // GetSessionSigsProps,
  IRelayPKP,
  LIT_NETWORKS_KEYS,
  LitAbility,
  SessionSigs,
} from "@lit-protocol/types";

export const DOMAIN =
  process.env.NEXT_PUBLIC_DOMAIN || "localhost";

export const ORIGIN =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? `https://${DOMAIN}`
    : `http://${DOMAIN}:3001`;

export const SELECTED_LIT_NETWORK = ((process.env
  .NEXT_PUBLIC_LIT_NETWORK as string) ||
  LIT_NETWORK.DatilDev) as LIT_NETWORKS_KEYS;

export const litNodeClient: LitNodeClient =
  new LitNodeClient({
    alertWhenUnauthorized: false,
    litNetwork: SELECTED_LIT_NETWORK,
    debug: true,
  });

litNodeClient.connect();

export const litAuthClient: LitAuthClient =
  new LitAuthClient({
    litRelayConfig: {
      relayApiKey: "test-api-key",
    },
    litNodeClient,
  });

export const signInWithGoogle = async (
  redirectUri: string
): Promise<void> => {
  const googleProvider =
    litAuthClient.initProvider<GoogleProvider>(
      ProviderType.Google,
      {
        redirectUri,
      }
    );

  await googleProvider.signIn();
};

export async function authenticateWithGoogle(
  redirectUri: string
): Promise<AuthMethod | undefined> {
  const googleProvider =
    litAuthClient.initProvider<GoogleProvider>(
      ProviderType.Google,
      { redirectUri }
    );
  const authMethod = await googleProvider.authenticate();
  return authMethod;
}

/**
 * Get provider for given auth method
 */
function getProviderByAuthMethod(authMethod: AuthMethod) {
  switch (authMethod.authMethodType) {
    case AuthMethodType.GoogleJwt:
      return litAuthClient.getProvider(ProviderType.Google);
    case AuthMethodType.Discord:
      return litAuthClient.getProvider(
        ProviderType.Discord
      );
    case AuthMethodType.EthWallet:
      return litAuthClient.getProvider(
        ProviderType.EthWallet
      );
    case AuthMethodType.WebAuthn:
      return litAuthClient.getProvider(
        ProviderType.WebAuthn
      );
    case AuthMethodType.StytchEmailFactorOtp:
      return litAuthClient.getProvider(
        ProviderType.StytchEmailFactorOtp
      );
    case AuthMethodType.StytchSmsFactorOtp:
      return litAuthClient.getProvider(
        ProviderType.StytchSmsFactorOtp
      );
    default:
      return;
  }
}

export async function mintPKP(
  authMethod: AuthMethod
): Promise<IRelayPKP> {
  const provider = getProviderByAuthMethod(authMethod);
  // Set scope of signing any data
  const options = {
    permittedAuthMethodScopes: [
      [AuthMethodScope.SignAnything],
    ],
  };

  // let txHash: string;

  // if (
  //   authMethod.authMethodType === AuthMethodType.WebAuthn
  // ) {
  //   // Register new WebAuthn credential
  //   const webAuthnInfo = await (
  //     provider as WebAuthnProvider
  //   ).register();

  //   // Verify registration and mint PKP through relay server
  //   txHash = await (
  //     provider as WebAuthnProvider
  //   ).verifyAndMintPKPThroughRelayer(webAuthnInfo, options);
  // } else {
  // Mint PKP through relay server
  const txHash: string = await (
    provider as BaseProvider
  ).mintPKPThroughRelayer(authMethod, options);
  // }

  let attempts = 3;
  let response = null;

  while (attempts > 0) {
    try {
      response = await (
        provider as BaseProvider
      ).relay.pollRequestUntilTerminalState(txHash);
      break;
    } catch (err) {
      console.warn("Minting failed, retrying...", err);

      // give it a second before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );
      attempts--;
    }
  }

  if (!response || response.status !== "Succeeded") {
    throw new Error("Minting failed");
  }

  const newPKP: IRelayPKP = {
    tokenId: response.pkpTokenId as string,
    publicKey: response.pkpPublicKey as string,
    ethAddress: response.pkpEthAddress as string,
  };

  return newPKP;
}

/**
 * Fetch PKPs associated with given auth method
 */
export async function getPKPs(
  authMethod: AuthMethod
): Promise<IRelayPKP[]> {
  const provider = getProviderByAuthMethod(
    authMethod
  ) as BaseProvider;
  const allPKPs = await provider.fetchPKPsThroughRelayer(
    authMethod
  );
  return allPKPs;
}

/**
 * Fetch session sigs if they exist
 */
export function fetchSessionSigs() {
  // litNodeClient.getSessionSigs()
  // return await litNodeClient.getSessionKey();
  const storedSessionSig = localStorage.getItem(
    "lit-wallet-sig"
  );

  return storedSessionSig;
}

/**
 * Generate session sigs for given params
 */
export async function getSessionSigs({
  pkpPublicKey,
  authMethod,
}: // sessionSigsParams,
{
  pkpPublicKey: string;
  authMethod: AuthMethod;
  // sessionSigsParams: GetSessionSigsProps;
}): Promise<SessionSigs> {
  const provider = getProviderByAuthMethod(authMethod);
  if (provider) {
    await litNodeClient.connect();

    const sessionSigs =
      await litNodeClient.getPkpSessionSigs({
        pkpPublicKey,
        authMethods: [authMethod],
        resourceAbilityRequests: [
          {
            resource: new LitPKPResource("*"),
            ability: LitAbility.PKPSigning,
          },
        ],
      });
    console.log("SESSIONS SIGS", sessionSigs);
    return sessionSigs;
  } else {
    throw new Error(
      `Provider not found for auth method type ${authMethod.authMethodType}`
    );
  }
}
