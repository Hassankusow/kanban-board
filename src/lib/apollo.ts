// src/lib/apollo.ts
"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { nhost } from "./nhost";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: nhost.graphql.httpUrl,
    headers: {
      "x-hasura-admin-secret": process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET ?? "",
    },
  }),
  cache: new InMemoryCache(),
});
