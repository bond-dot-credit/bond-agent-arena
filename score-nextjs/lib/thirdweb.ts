import { createThirdwebClient, defineChain } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";

if (!clientId) {
  console.warn("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Wallet connection features may not work.");
}

export const client = createThirdwebClient({
  clientId: clientId,
});

export const chain = defineChain(42161);
