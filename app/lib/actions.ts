'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const formInvoiceSchema = z
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

  const { amount, customerId, status } = formInvoiceSchema.parse(rawFormData);

  const amountInCents = amount * 100;
  const createDate = new Date().toISOString().split('T')[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${createDate})
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function editInvoice(id: string, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  const { amount, customerId, status } = formInvoiceSchema.parse(rawFormData);

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id=${customerId}, amount=${amountInCents}, status=${status}
    WHERE id=${id}
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Edit Invoice',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string, formData: FormData) {
  try {
    await sql`
    DELETE FROM invoices WHERE id=${id}
  `;

    revalidatePath('/dashboard/invoices');
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Invoice',
    };
  }
}
