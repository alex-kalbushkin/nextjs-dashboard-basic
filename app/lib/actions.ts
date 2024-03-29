'use server';

import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export interface IInvoiceFormState {
  message?: string | null;
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
}

const formInvoiceSchema = z
  .object({
    id: z.string(),
    customerId: z.string({ required_error: 'Please, select a customer' }),
    amount: z.coerce.number().gt(0, 'Please, enter an amount greater than 0'),
    status: z.enum(['pending', 'paid'], {
      required_error: 'Please, select an invoice status',
    }),
    date: z.string(),
  })
  .omit({ id: true, date: true })
  .required({ customerId: true, amount: true, status: true });

export async function createInvoices(
  formState: IInvoiceFormState,
  formData: FormData,
) {
  const rawFormData = Object.fromEntries(formData.entries());

  const validateFields = formInvoiceSchema.safeParse(rawFormData);

  if (!validateFields.success) {
    return {
      message: 'Missing Fields. Failed to Create Invoice.',
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const { customerId, amount, status } = validateFields.data;

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

export async function editInvoice(
  id: string,
  formState: IInvoiceFormState,
  formData: FormData,
) {
  const rawFormData = Object.fromEntries(formData.entries());

  const validateFields = formInvoiceSchema.safeParse(rawFormData);

  if (!validateFields.success) {
    return {
      message: 'Failed to Create Invoice.',
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const { amount, customerId, status } = validateFields.data;

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

export async function authenticate(
  formState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === 'CredentialsSignin'
        ? 'Invalid credentials'
        : 'Something went wrong';
    }

    throw error;
  }
}
