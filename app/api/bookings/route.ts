import { createCollectionApi } from "@/lib/server/collection-api";

const handlers = createCollectionApi("medcin_bookings");

export const GET = handlers.GET;
export const PUT = handlers.PUT;
