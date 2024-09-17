import { useCallback, useEffect, useState } from "react";
import {
  isSignInRedirect,
  getProviderFromUrl,
} from "@lit-protocol/lit-auth-client";
import { AuthMethod } from "@lit-protocol/types";
import { authenticateWithGoogle } from "../utils/lit";
// import { useConnect } from "wagmi";

export default function useAuthenticate(
  redirectUri: string
) {
  const [authMethod, setAuthMethod] =
    useState<AuthMethod>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  // wagmi hook
  //   const { connectAsync } = useConnect({
  //     mutation: {
  //       onError: (err: unknown) => {
  //         setError(err as Error);
  //       },
  //     },
  //   });

  /**
   * Handle redirect from Google OAuth
   */
  const authWithGoogle =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setError(undefined);
      setAuthMethod(undefined);
      console.log("hit authwithgogle");
      try {
        const result: AuthMethod =
          (await authenticateWithGoogle(
            redirectUri
          )) as AuthMethod;
        console.log("result of authmethod", result);
        setAuthMethod(result);
      } catch (err: unknown) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }, [redirectUri]);

  useEffect(() => {
    // Check if user is redirected from social login
    console.log("hit initial useeffect", redirectUri);
    if (redirectUri && isSignInRedirect(redirectUri)) {
      console.log("check provider from url");
      // If redirected, authenticate with social provider
      const providerName = getProviderFromUrl();
      if (providerName === "google") {
        console.log("redirecting");
        authWithGoogle();
      }
    }
  }, [redirectUri, authWithGoogle]);

  return {
    authMethod,
    loading,
    error,
  };
}
