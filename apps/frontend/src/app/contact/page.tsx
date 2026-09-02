'use client';

import { ContactFormSection } from '@/features/contact';

export default function ContactPage() {
  return (
    <div className="bg-sl-void text-sl-alabaster min-h-screen overflow-hidden">
      <ContactFormSection
        eyebrow="§ 01 — Contact"
        title="Start a Conversation"
        subtitle="Have a project in mind? Fill out the form and our architects will review your vision. We respond within 24 hours."
      />
    </div>
  );
}
