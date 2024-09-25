"use client";
import { ORIGIN } from "@/utils/lit";
import { GoogleSignIn } from "./GoogleSignIn";
import useAuthenticate from "@/hooks/useAuthenticate";
import { useEffect, useState } from "react";
import useAccounts from "@/hooks/useAccounts";
import useSession from "@/hooks/useSession";
import Loading from "./Loading";
import { AuthMethodType } from "@lit-protocol/constants";
import { useRouter } from "next/navigation";
import { useEncrypt } from "@/hooks/useEncrypt";

export default function SignUp() {
  const redirectUri = ORIGIN;

  const [message] = useState<string>("Free the web!");
  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri);

  const {
    encrypt,
    decrypt,
    isEncrypted,
    encryptedData,
    decryptedMessage,
  } = useEncrypt();
  const {
    createAccount,

    currentAccount,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();
  const {
    initSession,
    sessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useSession();
  const router = useRouter();

  const error = authError || accountsError || sessionError;

  if (error) {
    if (authError) {
      console.error("Auth error:", authError);
    }

    if (accountsError) {
      console.error("Accounts error:", accountsError);
    }

    if (sessionError) {
      console.error("Session error:", sessionError);
    }
  }

  useEffect(() => {
    // If user is authenticated, create an account
    // For WebAuthn, the account creation is handled by the registerWithWebAuthn function
    if (
      authMethod &&
      authMethod.authMethodType !== AuthMethodType.WebAuthn
    ) {
      router.replace(window.location.pathname, undefined);
      createAccount(authMethod);
    }
  }, [authMethod, createAccount]);

  useEffect(() => {
    // If user is authenticated and has at least one account, initialize session
    if (authMethod && currentAccount) {
      initSession(authMethod, currentAccount);
    }
  }, [authMethod, currentAccount, initSession]);

  if (authLoading) {
    return (
      <Loading
        copy={"Authenticating your credentials..."}
        error={error}
      />
    );
  }

  if (accountsLoading) {
    return (
      <Loading
        copy={"Fetching your account..."}
        error={error}
      />
    );
  }

  if (sessionLoading) {
    return (
      <Loading
        copy={"Securing your session..."}
        error={error}
      />
    );
  }

  if (currentAccount && sessionSigs) {
    return (
      <>
        <p>CurrentAccount: {currentAccount.ethAddress}</p>
        <p>
          {isEncrypted
            ? encryptedData.ciphertext
            : decryptedMessage}
        </p>

        {isEncrypted ? (
          <button
            onClick={() =>
              decrypt(currentAccount.ethAddress)
            }
          >
            decrypt
          </button>
        ) : (
          <button
            onClick={() =>
              encrypt(message, currentAccount.ethAddress)
            }
          >
            ENCRYPT MESSAGE
          </button>
        )}
      </>
    );
  }
  return (
    <>
      <GoogleSignIn />
    </>
  );
}
