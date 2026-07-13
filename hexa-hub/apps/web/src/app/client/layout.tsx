import React from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-obsidian text-white">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <div className="font-serif text-2xl">
          HEXA <span className="text-gold">CLIENT</span>
        </div>
        <div className="flex items-center gap-6 text-sm uppercase tracking-widest text-neutral-400">
          <a href="/client" className="text-white hover:text-gold transition-colors">Dashboard</a>
          <a href="#" className="hover:text-white transition-colors">My Projects</a>
          <a href="#" className="hover:text-white transition-colors">Invoices</a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
