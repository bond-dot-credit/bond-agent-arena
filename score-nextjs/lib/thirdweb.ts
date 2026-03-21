import { createThirdwebClient, defineChain } from "thirdweb";

export const chain = defineChain(8453);

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '';

export const client = createThirdwebClient({
  clientId: clientId || 'placeholder',
});
