import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// The Neon/Vercel integration can expose the connection string under a few
// different names depending on which integration variant was installed.
const DB_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
] as const;

export function resolveDatabaseUrl(): string | undefined {
  for (const key of DB_URL_KEYS) {
    const val = process.env[key];
    if (val) return val;
  }
  return undefined;
}

// Lazy initialization: calling neon() at module load would throw during
// `next build` before the DB is provisioned. We also deliberately avoid
// wrapping the client in a Proxy (it breaks libraries that introspect it).
let _sql: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = resolveDatabaseUrl();
    if (!url) {
      throw new Error(
        `No database URL set. Expected one of: ${DB_URL_KEYS.join(", ")}. ` +
          "Connect Neon to the Vercel project and run `vercel env pull .env.local`."
      );
    }
    // The Neon driver runs queries over fetch; Next.js otherwise caches those
    // fetches and serves stale rows after a write. no-store forces fresh reads.
    _sql = neon(url, { fetchOptions: { cache: "no-store" } });
  }
  return _sql;
}

/**
 * Run a parameterized query (Postgres $1, $2, ... placeholders) and return the
 * rows. Mirrors the old Express `db.all(query, params, cb)` shape so the ported
 * route handlers stay close to the original SQL.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const sql = getSql();
  const rows = await sql.query(text, params);
  return rows as T[];
}
