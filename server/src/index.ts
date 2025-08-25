import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createGuestInputSchema, 
  createRsvpInputSchema, 
  updateRsvpInputSchema,
  createWeddingPhotoInputSchema,
  updateWeddingInfoInputSchema
} from './schema';

// Import handlers
import { createGuest } from './handlers/create_guest';
import { getGuestByName } from './handlers/get_guest_by_name';
import { getGuests } from './handlers/get_guests';
import { createRsvp } from './handlers/create_rsvp';
import { updateRsvp } from './handlers/update_rsvp';
import { getRsvpByGuest } from './handlers/get_rsvp_by_guest';
import { getWeddingPhotos } from './handlers/get_wedding_photos';
import { getMainWeddingPhoto } from './handlers/get_main_wedding_photo';
import { getGalleryPhotos } from './handlers/get_gallery_photos';
import { createWeddingPhoto } from './handlers/create_wedding_photo';
import { getWeddingInfo } from './handlers/get_wedding_info';
import { updateWeddingInfo } from './handlers/update_wedding_info';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Guest management routes
  createGuest: publicProcedure
    .input(createGuestInputSchema)
    .mutation(({ input }) => createGuest(input)),

  getGuestByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => getGuestByName(input.name)),

  getGuests: publicProcedure
    .query(() => getGuests()),

  // RSVP management routes
  createRsvp: publicProcedure
    .input(createRsvpInputSchema)
    .mutation(({ input }) => createRsvp(input)),

  updateRsvp: publicProcedure
    .input(updateRsvpInputSchema)
    .mutation(({ input }) => updateRsvp(input)),

  getRsvpByGuest: publicProcedure
    .input(z.object({ guestId: z.number() }))
    .query(({ input }) => getRsvpByGuest(input.guestId)),

  // Wedding photo management routes
  getWeddingPhotos: publicProcedure
    .query(() => getWeddingPhotos()),

  getMainWeddingPhoto: publicProcedure
    .query(() => getMainWeddingPhoto()),

  getGalleryPhotos: publicProcedure
    .query(() => getGalleryPhotos()),

  createWeddingPhoto: publicProcedure
    .input(createWeddingPhotoInputSchema)
    .mutation(({ input }) => createWeddingPhoto(input)),

  // Wedding information routes
  getWeddingInfo: publicProcedure
    .query(() => getWeddingInfo()),

  updateWeddingInfo: publicProcedure
    .input(updateWeddingInfoInputSchema)
    .mutation(({ input }) => updateWeddingInfo(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();