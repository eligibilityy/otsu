import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { dirname } from "node:path";
import type { TokenStore, StoredOAuthTokens } from "./token-store.js";

/**
 * Persist tokens to a JSON file on disk.
 * Parent directories are created automatically.
 */
export class FileTokenStore implements TokenStore {
  constructor(private readonly filePath: string) {}

  async get(): Promise<StoredOAuthTokens | null> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return JSON.parse(raw) as StoredOAuthTokens;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  async set(tokens: StoredOAuthTokens): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(tokens, null, 2), "utf8");
  }

  async clear(): Promise<void> {
    try {
      await unlink(this.filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

/**
 * Create a file-backed token store for the authorization-code flow.
 *
 * @param filePath - Path to a JSON file for reading and writing tokens
 * @returns A {@link TokenStore} that persists tokens to disk
 *
 * @remarks Parent directories are created automatically. The file contains
 * access and refresh tokens — restrict file permissions in production.
 */
export function fileTokenStore(filePath: string): FileTokenStore {
  return new FileTokenStore(filePath);
}
