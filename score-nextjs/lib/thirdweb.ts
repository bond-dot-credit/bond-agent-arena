import { createThirdwebClient, defineChain } from "thirdweb";

export const chain = defineChain(8453);

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error(
    'Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID. ' +
    'Please set it in .env.local. Get your Client ID at https://thirdweb.com/dashboard/settings/api-keys'
  );
}

export const client = createThirdwebClient({
  clientId,
});
