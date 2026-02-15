'use client';

import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/lib/thirdweb";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}