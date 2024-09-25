import {
  decryptMessages,
  encryptMessages,
} from "@/utils/lit";
import { EncryptResponse } from "@lit-protocol/types";
import { useCallback, useState } from "react";

export const useEncrypt = () => {
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [encryptedData, setEncryptedData] =
    useState<EncryptResponse>({
      // Fill in with your EncryptResponse structure
      ciphertext: "",
      dataToEncryptHash: "",
    });
  const [decryptedMessage, setDecryptedMessage] =
    useState("");

  const encrypt = useCallback(
    async (message: string, address: string) => {
      const data = await encryptMessages(message, address);

      setEncryptedData(data);
      setIsEncrypted(true);
    },
    []
  );

  const decrypt = useCallback(
    async (address: string) => {
      const message = await decryptMessages(
        encryptedData,
        address
      );

      setIsEncrypted(false);
      setDecryptedMessage(message);
    },
    [encryptedData]
  );

  return {
    encrypt,
    decrypt,
    isEncrypted,
    encryptedData,
    decryptedMessage,
  };
};
