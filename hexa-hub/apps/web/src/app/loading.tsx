'use client';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
        <p className="text-[#555] text-sm font-light tracking-wide">Loading...</p>
      </div>
    </div>
  );
}
