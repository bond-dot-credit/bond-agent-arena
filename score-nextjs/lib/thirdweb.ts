import { createThirdwebClient, defineChain } from "thirdweb";

export const chain = defineChain(8453);

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});
