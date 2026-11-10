import { z } from "zod";
import { AGENT_STATUS_VALUES } from "../constants.js";

export const createAgentSchema = z.object({
  full_name: z
    .string({ required_error: "full_name is required" })
    .trim()
    .min(1, "full_name must not be empty")
    .max(100, "full_name must be at most 100 characters"),

  phone: z
    .string({ required_error: "phone is required" })
    .trim()
    .regex(/^[0-9]{10}$/, "phone must be a valid 10-digit number"),

  email: z
    .string({ required_error: "email is required" })
    .trim()
    .email("email must be a valid email address")
    .max(255, "email must be at most 255 characters"),

  service_area: z
    .string({ required_error: "service_area is required" })
    .trim()
    .min(1, "service_area must not be empty")
    .max(100, "service_area must be at most 100 characters"),

  status: z.enum(AGENT_STATUS_VALUES).optional(),
});

// For PUT (full replacement) we require the same fields, so we reuse the schema
export const updateAgentSchema = createAgentSchema;

export const listAgentsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(AGENT_STATUS_VALUES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Validates the :id route param as a positive integer
export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "id must be a number" })
    .int("id must be an integer")
    .positive("id must be a positive integer"),
});