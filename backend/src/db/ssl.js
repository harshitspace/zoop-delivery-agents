import fs from "fs";

// Builds the mysql2 `ssl` option based on env.
//  - DB_SSL != "true"        -> undefined (local MySQL, no SSL)
//  - DB_CA_CERT (inline PEM) -> verify against this CA (best for Render/prod)
//  - DB_CA_PATH (file path)  -> verify against the CA file (best for local)
//  - neither CA provided     -> rejectUnauthorized true (works only if the CA
//                               is already in Node's trust store)
export const buildSslConfig = () => {
  if (process.env.DB_SSL !== "true") return undefined;

  if (process.env.DB_CA_CERT) {
    return { ca: process.env.DB_CA_CERT, rejectUnauthorized: true };
  }

  if (process.env.DB_CA_PATH) {
    return { ca: fs.readFileSync(process.env.DB_CA_PATH, "utf-8"), rejectUnauthorized: true };
  }

  return { rejectUnauthorized: true };
};
