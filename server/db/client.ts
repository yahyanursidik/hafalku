import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { loadEnv } from "../config/env";

type Database = ReturnType<typeof drizzle>;
type SqlConnection = ReturnType<typeof neon>;

let database: Database | undefined;
let sqlConnection: SqlConnection | undefined;

export function getSqlConnection(): SqlConnection {
  if (!sqlConnection) {
    sqlConnection = neon(loadEnv().DATABASE_URL);
  }

  return sqlConnection;
}

export function getDatabase(): Database {
  if (!database) {
    database = drizzle(getSqlConnection());
  }

  return database;
}

export async function checkDatabaseConnection(): Promise<void> {
  await getDatabase().execute(sql`select 1`);
}
