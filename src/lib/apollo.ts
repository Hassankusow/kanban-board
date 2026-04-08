// src/lib/apollo.ts
"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { nhost } from "./nhost";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: nhost.graphql.httpUrl,
    headers: {
      "x-hasura-admin-secret": "P$a(2m,RiO)#_CLnRowYDLT7Tg;5CIMh",
    },
  }),
  cache: new InMemoryCache(),
});
