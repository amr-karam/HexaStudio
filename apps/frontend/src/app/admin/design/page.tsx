import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design & Content — Hexa Command Centre',
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <p className="font-['JetBrains_Mono'] text-[10px] text-accent uppercase tracking-[0.2em]">Design &amp; Content</p>
        <p className="font-['Bodoni_Moda'] text-lg text-sl-mist mt-2 italic">
          Edit the design in the left panel
        </p>
        <p className="text-xs text-sl-silver mt-1 font-['JetBrains_Mono']">
          Changes reflect live in the preview frame
        </p>
      </div>
    </main>
  );
}
