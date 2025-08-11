// codegen.ts
import type { CodegenConfig } from "@graphql-codegen/cli";
import { nhost } from "./src/lib/nhost";

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [nhost.graphql.httpUrl]: {
      headers: {
        "x-hasura-admin-secret": "P$a(2m,RiO)#_CLnRowYDLT7Tg;5CIMh",
      },
    },
  },
  documents: "src/**/*.{tsx,graphql}",
  generates: {
    "src/graphql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
    },
  },
};

export default config;
