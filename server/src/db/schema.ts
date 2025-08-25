import { serial, text, pgTable, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const guestsTable = pgTable('guests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'), // Nullable by default
  phone: text('phone'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const rsvpsTable = pgTable('rsvps', {
  id: serial('id').primaryKey(),
  guest_id: integer('guest_id').notNull().references(() => guestsTable.id),
  will_attend: boolean('will_attend').notNull(),
  number_of_guests: integer('number_of_guests').notNull().default(1),
  message: text('message'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const weddingPhotosTable = pgTable('wedding_photos', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  alt_text: text('alt_text'), // Nullable by default
  is_main_photo: boolean('is_main_photo').notNull().default(false),
  gallery_order: integer('gallery_order'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const weddingInfoTable = pgTable('wedding_info', {
  id: serial('id').primaryKey(),
  bride_full_name: text('bride_full_name').notNull(),
  bride_nickname: text('bride_nickname').notNull(),
  bride_father: text('bride_father').notNull(),
  bride_mother: text('bride_mother').notNull(),
  groom_full_name: text('groom_full_name').notNull(),
  groom_nickname: text('groom_nickname').notNull(),
  groom_father: text('groom_father').notNull(),
  groom_mother: text('groom_mother').notNull(),
  ceremony_date: timestamp('ceremony_date').notNull(),
  ceremony_time_start: text('ceremony_time_start').notNull(),
  ceremony_time_end: text('ceremony_time_end').notNull(),
  ceremony_location: text('ceremony_location').notNull(),
  reception_date: timestamp('reception_date').notNull(),
  reception_time_start: text('reception_time_start').notNull(),
  reception_time_end: text('reception_time_end').notNull(),
  reception_location: text('reception_location').notNull(),
  reception_maps_url: text('reception_maps_url'), // Nullable by default
  bank_name: text('bank_name').notNull(),
  account_holder: text('account_holder').notNull(),
  account_number: text('account_number').notNull(),
  rsvp_message: text('rsvp_message').notNull(),
  rsvp_deadline: timestamp('rsvp_deadline').notNull(),
  co_invitation_message: text('co_invitation_message').notNull(),
  quran_verse: text('quran_verse').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const guestsRelations = relations(guestsTable, ({ one }) => ({
  rsvp: one(rsvpsTable, {
    fields: [guestsTable.id],
    references: [rsvpsTable.guest_id],
  }),
}));

export const rsvpsRelations = relations(rsvpsTable, ({ one }) => ({
  guest: one(guestsTable, {
    fields: [rsvpsTable.guest_id],
    references: [guestsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Guest = typeof guestsTable.$inferSelect;
export type NewGuest = typeof guestsTable.$inferInsert;

export type RSVP = typeof rsvpsTable.$inferSelect;
export type NewRSVP = typeof rsvpsTable.$inferInsert;

export type WeddingPhoto = typeof weddingPhotosTable.$inferSelect;
export type NewWeddingPhoto = typeof weddingPhotosTable.$inferInsert;

export type WeddingInfo = typeof weddingInfoTable.$inferSelect;
export type NewWeddingInfo = typeof weddingInfoTable.$inferInsert;

// Important: Export all tables and relations for proper query building
export const tables = {
  guests: guestsTable,
  rsvps: rsvpsTable,
  weddingPhotos: weddingPhotosTable,
  weddingInfo: weddingInfoTable,
};