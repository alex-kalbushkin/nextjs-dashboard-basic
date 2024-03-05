'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const createInvoicesSchema = z
  .object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  })
  .omit({ id: true, date: true });

export async function createInvoices(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  const { amount, customerId, status } =
    createInvoicesSchema.parse(rawFormData);

  const amountInCents = amount * 100;
  const createDate = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${createDate})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
