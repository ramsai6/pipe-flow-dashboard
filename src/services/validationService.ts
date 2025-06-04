
import { z } from 'zod';

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(254, 'Email too long'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password too long'),
});

export const signupSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(50, 'Username too long'),
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(254, 'Email too long'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password too long'),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID required'),
    quantity: z.number().min(1, 'Quantity must be at least 1').max(1000, 'Quantity too large'),
  })).min(1, 'At least one item required'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address too long'),
  deliveryDate: z.string().min(1, 'Delivery date required'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  vendorEmail: z.string().email('Invalid vendor email').optional(),
});

export const guestOrderSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number too long')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Invalid phone number format'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address too long'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID required'),
    quantity: z.number().min(1, 'Quantity must be at least 1').max(1000, 'Quantity too large'),
  })).min(1, 'At least one item required'),
});

export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: any): T => {
  // Sanitize string fields recursively
  const sanitizedData = sanitizeObject(data);
  
  // Validate with schema
  const result = schema.safeParse(sanitizedData);
  
  if (!result.success) {
    throw new Error(result.error.errors[0].message);
  }
  
  return result.data;
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};
