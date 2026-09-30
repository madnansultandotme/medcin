import { NextResponse } from "next/server";
import { readLocalState, updateLocalState, type LocalState } from "@/lib/server/local-state-repository";

export function createCollectionApi(storageKey: string) {
  return {
    async GET() {
      const state = await readLocalState();
      return NextResponse.json({ data: state[storageKey] ?? null });
    },

    async PUT(request: Request) {
      try {
        const body = (await request.json()) as { data?: unknown };
        if (!("data" in body)) {
          return NextResponse.json({ error: "Request body must include data." }, { status: 400 });
        }

        const state = await updateLocalState({ [storageKey]: body.data } as LocalState);
        return NextResponse.json({ data: state[storageKey] });
      } catch {
        return NextResponse.json({ error: "Unable to persist resource." }, { status: 500 });
      }
    },
  };
}
