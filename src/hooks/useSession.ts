import { useCallback, useEffect, useState } from "react";
import { AuthMethod } from "@lit-protocol/types";
import {
  fetchSessionSigs,
  getSessionSigs,
} from "../utils/lit";
// import {
//   LitAbility,
//   LitActionResource,
// } from "@lit-protocol/auth-helpers";
import { IRelayPKP } from "@lit-protocol/types";
import { SessionSigs } from "@lit-protocol/types";

export default function useSession() {
  const [sessionSigs, setSessionSigs] =
    useState<SessionSigs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const storedSession = fetchSessionSigs();
    if (storedSession) {
      const session = JSON.parse(storedSession);
      const isExpired =
        new Date(session.expiration) < new Date();
      if (!isExpired) {
        console.log("setting existing sessions", session);
        setSessionSigs(session);
      }
    }
  }, []);

  /**
   * Generate session sigs and store new session data
   */
  const initSession = useCallback(
    async (
      authMethod: AuthMethod,
      pkp: IRelayPKP
    ): Promise<void> => {
      setLoading(true);
      setError(undefined);
      try {
        // Prepare session sigs params
        // const chain = "ethereum";
        // const resourceAbilities = [
        //   {
        //     resource: new LitActionResource("*"),
        //     ability: LitAbility.PKPSigning,
        //   },
        // ];
        // const expiration = new Date(
        //   Date.now() + 1000 * 60 * 60 * 24 * 7
        // ).toISOString(); // 1 week

        // Generate session sigs
        console.log("Generating session sigs");
        const sessionSigs = await getSessionSigs({
          pkpPublicKey: pkp.publicKey,
          authMethod,
          // sessionSigsParams: {
          //   chain,
          //   expiration,
          //   resourceAbilityRequests: resourceAbilities,
          // },
        });

        setSessionSigs(sessionSigs);
      } catch (err) {
        setError(err as unknown as Error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    initSession,
    sessionSigs,
    loading,
    error,
  };
}
