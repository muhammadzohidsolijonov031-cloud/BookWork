const { z } = require("zod");

const reviewSchema = z.object({
  content: z.string().trim().min(3).max(2000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
});

const bookPostSchema = z.object({
  kind: z.enum(["THOUGHT", "QUOTE"]),
  content: z.string().trim().min(3).max(2000),
  excerpt: z.string().trim().max(1200).optional().nullable(),
  location: z.string().trim().max(100).optional().nullable(),
}).refine((post) => post.kind !== "QUOTE" || Boolean(post.excerpt?.trim()), {
  path: ["excerpt"],
  message: "Kitobdan olgan G'oyangizni kiriting.",
});

const readerProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  bio: z.string().trim().max(500).optional().nullable(),
  genres: z.array(z.string().trim().min(1).max(60)).max(20),
  openToPartners: z.boolean(),
});

const groupSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(10).max(1000),
  genre: z.string().trim().max(60).optional().nullable(),
});

const partnerInterestSchema = z.object({
  bookId: z.number().int().positive(),
  enabled: z.boolean(),
});

const partnerConnectionSchema = z.object({
  recipientId: z.string().trim().min(1).max(255),
  bookId: z.number().int().positive(),
});

const chatMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

module.exports = {
  reviewSchema,
  bookPostSchema,
  readerProfileSchema,
  groupSchema,
  partnerInterestSchema,
  partnerConnectionSchema,
  chatMessageSchema,
};
