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
import { Snippet } from "@nextui-org/snippet";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";

export default function SignUp() {
  const redirectUri = ORIGIN;

  const [message, setMessage] = useState<string>();
  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri);

  const { encrypt, decrypt, isEncrypted, encryptedData } =
    useEncrypt();
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
        <Snippet size="sm" className="snippet">
          {currentAccount.ethAddress}
        </Snippet>

        <>
          <Input
            type={isEncrypted ? "password" : "text"}
            label="secret"
            isRequired
            size="md"
            variant="underlined"
            className="mx-auto mt-10 w-[1/2]"
            defaultValue={encryptedData.ciphertext}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            color={isEncrypted ? "success" : "danger"}
            className="mx-auto mt-10 max-w-32"
            disabled={!message}
            onClick={() =>
              isEncrypted
                ? decrypt(currentAccount.ethAddress)
                : encrypt(
                    message as string,
                    currentAccount.ethAddress
                  )
            }
          >
            {isEncrypted ? "Decrypt" : "Encrypt"}
          </Button>
        </>
      </>
    );
  }
  return (
    <>
      <p className=" font-light size text-md text-center">
        Use Your Google Auth to Generate a PKP with ease by
        signing in below
      </p>
      <div className="mx-auto mt-10">
        <GoogleSignIn />
      </div>
    </>
  );
}
