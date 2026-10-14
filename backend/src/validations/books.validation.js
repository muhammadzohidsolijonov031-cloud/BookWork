const { z } = require("zod");

const httpUrl = (message) =>
  z
    .string()
    .url(message)
    .refine((value) => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, message);

const createBookSchema = z.object({
  title: z.string().min(2, "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak"),
  author: z.string().min(2, "Muallif nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  description: z.string().optional(),
  imageUrl: z
    .union([
      httpUrl("Rasm URL noto'g'ri formatda"),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  pdfUrl: httpUrl("PDF manzili to'g'ri havola bo'lishi kerak"),
  licenseConfirmed: z.literal(true, {
    error: "PDF ochiq litsenziyali yoki public domain ekanini tasdiqlang",
  }),
  isPublic: z.boolean().default(false),
  status: z.string().default("wishlist"),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  language: z.string().min(2, "Til nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  type: z.string().optional(),
  hooks: z.string().optional(),
  pages: z.string().optional(),
  cost: z.string().optional(),
  maslahatBeraman: z.boolean().default(true),
});

const updateBookSchema = z.object({
  title: z.string().min(2).optional(),
  author: z.string().min(2).optional(),
  description: z.string().optional(),
  imageUrl: z
    .union([httpUrl("Rasm URL noto'g'ri formatda"), z.literal(""), z.null()])
    .optional(),
  pdfUrl: httpUrl("PDF manzili to'g'ri havola bo'lishi kerak").nullable().optional(),
  licenseConfirmed: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  status: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  language: z.string().min(2).optional(),
  type: z.string().optional(),
  hooks: z.string().optional(),
  pages: z.string().optional(),
  cost: z.string().optional(),
  maslahatBeraman: z.boolean().optional(),
});

module.exports = { createBookSchema, updateBookSchema };
