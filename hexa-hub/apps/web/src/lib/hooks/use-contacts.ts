// ─── HEXA Hub — Contacts Hooks ─────────────────────────────────────────────
// React Query hooks for the Contacts module (partners, clients).
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useOdooList, useOdooItem, useOdooMutation } from './use-odoo-query';
import type {
  OdooContact,
  OdooCompany,
  CreateContactDto,
  UpdateContactDto,
} from '@hexa-hub/types';
import type { ListParams } from './use-odoo-query';

// ─── Query Key Constants ───────────────────────────────────────────────────

const CONTACTS_KEYS = {
  contacts: 'contacts',
  contact: 'contact',
  clients: 'contacts-clients',
  companies: 'contacts-companies',
} as const;

// ─── useContacts ────────────────────────────────────────────────────────────

/**
 * Fetch contacts with optional filters.
 * GET /odoo/contacts
 *
 * @param filters — Optional filter parameters (search, type, etc.).
 */
export function useContacts(filters?: ListParams) {
  return useOdooList<OdooContact>(
    CONTACTS_KEYS.contacts,
    '/odoo/contacts',
    filters,
  );
}

// ─── useContact ─────────────────────────────────────────────────────────────

/**
 * Fetch a single contact by ID.
 * GET /odoo/contacts/:id
 *
 * @param id — The contact ID.
 */
export function useContact(id?: string | number) {
  return useOdooItem<OdooContact>(
    CONTACTS_KEYS.contact,
    '/odoo/contacts',
    id,
  );
}

// ─── useClients ─────────────────────────────────────────────────────────────

/**
 * Fetch only client contacts (x_hexa_client = true).
 * GET /odoo/contacts/clients
 */
export function useClients() {
  return useOdooList<OdooContact>(
    CONTACTS_KEYS.clients,
    '/odoo/contacts/clients',
  );
}

// ─── useCompanies ───────────────────────────────────────────────────────────

/**
 * Fetch company contacts.
 * GET /odoo/contacts/companies
 */
export function useCompanies() {
  return useOdooList<OdooCompany>(
    CONTACTS_KEYS.companies,
    '/odoo/contacts/companies',
  );
}

// ─── useCreateContact ──────────────────────────────────────────────────────

/**
 * Create a new contact.
 * POST /odoo/contacts
 */
export function useCreateContact() {
  return useOdooMutation<OdooContact, CreateContactDto>(
    '/odoo/contacts',
    'POST',
    {
      invalidateKeys: [CONTACTS_KEYS.contacts, CONTACTS_KEYS.clients],
    },
  );
}

// ─── useUpdateContact ──────────────────────────────────────────────────────

/**
 * Update an existing contact.
 * PUT /odoo/contacts/:id
 *
 * @param id — The contact ID to update.
 */
export function useUpdateContact(id?: string | number) {
  return useOdooMutation<OdooContact, UpdateContactDto>(
    `/odoo/contacts/${id}`,
    'PUT',
    {
      invalidateKeys: [CONTACTS_KEYS.contacts, CONTACTS_KEYS.contact, CONTACTS_KEYS.clients],
    },
  );
}

// ─── useDeleteContact ──────────────────────────────────────────────────────

/**
 * Delete a contact.
 * DELETE /odoo/contacts/:id
 *
 * @param id — The contact ID to delete.
 */
export function useDeleteContact(id?: string | number) {
  return useOdooMutation<void, void>(
    `/odoo/contacts/${id}`,
    'DELETE',
    {
      invalidateKeys: [CONTACTS_KEYS.contacts, CONTACTS_KEYS.clients],
    },
  );
}
