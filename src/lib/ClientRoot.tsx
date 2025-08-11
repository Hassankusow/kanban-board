"use client";

import { ApolloProvider } from "@apollo/client";
import { NhostProvider } from "@nhost/react";
import { nhost } from "@/lib/nhost";
import { client } from "@/lib/apollo";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </NhostProvider>
  );
}
