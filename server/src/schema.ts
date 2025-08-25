import { z } from 'zod';

// Guest schema
export const guestSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Guest = z.infer<typeof guestSchema>;

// Input schema for creating guests
export const createGuestInputSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  email: z.string().email().nullable(),
  phone: z.string().nullable()
});

export type CreateGuestInput = z.infer<typeof createGuestInputSchema>;

// RSVP schema
export const rsvpSchema = z.object({
  id: z.number(),
  guest_id: z.number(),
  will_attend: z.boolean(),
  number_of_guests: z.number().int().min(1).max(10),
  message: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type RSVP = z.infer<typeof rsvpSchema>;

// Input schema for creating RSVP
export const createRsvpInputSchema = z.object({
  guest_id: z.number(),
  will_attend: z.boolean(),
  number_of_guests: z.number().int().min(1).max(10).default(1),
  message: z.string().nullable()
});

export type CreateRsvpInput = z.infer<typeof createRsvpInputSchema>;

// Input schema for updating RSVP
export const updateRsvpInputSchema = z.object({
  id: z.number(),
  will_attend: z.boolean().optional(),
  number_of_guests: z.number().int().min(1).max(10).optional(),
  message: z.string().nullable().optional()
});

export type UpdateRsvpInput = z.infer<typeof updateRsvpInputSchema>;

// Wedding photo schema
export const weddingPhotoSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  alt_text: z.string().nullable(),
  is_main_photo: z.boolean(),
  gallery_order: z.number().int().nullable(),
  created_at: z.coerce.date()
});

export type WeddingPhoto = z.infer<typeof weddingPhotoSchema>;

// Input schema for creating wedding photos
export const createWeddingPhotoInputSchema = z.object({
  url: z.string().url(),
  alt_text: z.string().nullable(),
  is_main_photo: z.boolean().default(false),
  gallery_order: z.number().int().nullable()
});

export type CreateWeddingPhotoInput = z.infer<typeof createWeddingPhotoInputSchema>;

// Wedding information schema
export const weddingInfoSchema = z.object({
  id: z.number(),
  bride_full_name: z.string(),
  bride_nickname: z.string(),
  bride_father: z.string(),
  bride_mother: z.string(),
  groom_full_name: z.string(),
  groom_nickname: z.string(),
  groom_father: z.string(),
  groom_mother: z.string(),
  ceremony_date: z.coerce.date(),
  ceremony_time_start: z.string(),
  ceremony_time_end: z.string(),
  ceremony_location: z.string(),
  reception_date: z.coerce.date(),
  reception_time_start: z.string(),
  reception_time_end: z.string(),
  reception_location: z.string(),
  reception_maps_url: z.string().url().nullable(),
  bank_name: z.string(),
  account_holder: z.string(),
  account_number: z.string(),
  rsvp_message: z.string(),
  rsvp_deadline: z.coerce.date(),
  co_invitation_message: z.string(),
  quran_verse: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type WeddingInfo = z.infer<typeof weddingInfoSchema>;

// Input schema for updating wedding info
export const updateWeddingInfoInputSchema = z.object({
  bride_full_name: z.string().optional(),
  bride_nickname: z.string().optional(),
  bride_father: z.string().optional(),
  bride_mother: z.string().optional(),
  groom_full_name: z.string().optional(),
  groom_nickname: z.string().optional(),
  groom_father: z.string().optional(),
  groom_mother: z.string().optional(),
  ceremony_date: z.coerce.date().optional(),
  ceremony_time_start: z.string().optional(),
  ceremony_time_end: z.string().optional(),
  ceremony_location: z.string().optional(),
  reception_date: z.coerce.date().optional(),
  reception_time_start: z.string().optional(),
  reception_time_end: z.string().optional(),
  reception_location: z.string().optional(),
  reception_maps_url: z.string().url().nullable().optional(),
  bank_name: z.string().optional(),
  account_holder: z.string().optional(),
  account_number: z.string().optional(),
  rsvp_message: z.string().optional(),
  rsvp_deadline: z.coerce.date().optional(),
  co_invitation_message: z.string().optional(),
  quran_verse: z.string().optional()
});

export type UpdateWeddingInfoInput = z.infer<typeof updateWeddingInfoInputSchema>;

// Guest with RSVP schema for combined queries
export const guestWithRsvpSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  created_at: z.coerce.date(),
  rsvp: rsvpSchema.nullable()
});

export type GuestWithRSVP = z.infer<typeof guestWithRsvpSchema>;