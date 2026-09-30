import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type LocalState = Record<string, JsonValue>;

const dataDirectory = path.join(process.cwd(), "data");
const stateFile = path.join(dataDirectory, "local-state.json");

export async function readLocalState(): Promise<LocalState> {
  try {
    const contents = await readFile(stateFile, "utf8");
    const parsed = JSON.parse(contents) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as LocalState)
      : {};
  } catch {
    return {};
  }
}

export async function updateLocalState(update: LocalState): Promise<LocalState> {
  const nextState = { ...(await readLocalState()), ...update };
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(stateFile, `${JSON.stringify(nextState, null, 2)}\n`, "utf8");
  return nextState;
}
