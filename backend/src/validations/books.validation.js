const { z } = require("zod");

const createBookSchema = z.object({
  title: z
    .string()
    .min(2, "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak"),
  description: z.string().optional(),
  imageUrl: z
    .union([z.string().url("Rasm URL noto'g'ri formatda"), z.literal("")])
    .optional(),
  status: z.enum(["O`qilmagan", "rejada", "chiqilgan"]).default("O`qilmagan"),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  language: z.string().min(2, "Iltimos kitob nomini to'liq kiriting"),
  maslahatBeraman: z.boolean().default(true),
});

const updateBookSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  imageUrl: z
    .union([z.string().url("Rasm URL noto'g'ri formatda"), z.literal("")])
    .optional(),
  status: z.enum(["O`qilmagan", "rejada", "O`qilgan"]).optional(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  language: z.string().min(2).optional(),
  maslahatBeraman: z.boolean().optional(),
});

module.exports = { createBookSchema, updateBookSchema };
