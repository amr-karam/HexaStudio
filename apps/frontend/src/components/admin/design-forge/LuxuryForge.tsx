'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/cards/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/inputs/Input';
import { toast } from 'sonner';

export interface ForgeResult {
  finalCode: string;
  iterations: number;
  finalScore: number;
  critiqueHistory: Array<{ iteration: number; score: number; assessment: string }>;
}

interface LuxuryForgeProps {
  onComponentGenerated?: (code: string) => void;
}

export const LuxuryForge: React.FC<LuxuryForgeProps> = ({ onComponentGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('UI Component');
  const [isForging, setIsForging] = useState(false);
  const [result, setResult] = useState<ForgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) return;

    setIsForging(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/audit/forge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim(), context }),
      });

      if (!response.ok) {
        const errData = (await response.json()) as { message?: string };
        throw new Error(errData.message ?? 'Forge request failed');
      }

      const data = (await response.json()) as ForgeResult;
      setResult(data);

      toast.success(`Luxury Forge Complete — ${data.finalScore}/100 in ${data.iterations} iteration(s)`);

      if (onComponentGenerated && data.finalScore >= 90) {
        onComponentGenerated(data.finalCode);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during forging.';
      setError(message);
      toast.error(message);
    } finally {
      setIsForging(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <Card.Header>
        <h2 className="text-lg font-semibold">Luxury Forge</h2>
        <p className="text-muted-foreground text-sm">
          Generate React components born with a 100 Luxury Score. The AI will audit and refine until the Supreme Law is met.
        </p>
      </Card.Header>

      <Card.Body className="space-y-4">
        <Input
          placeholder="Describe the component you want to forge (e.g., 'Minimalist pricing table for high-ticket consulting)'"
          value={prompt}
          onChange={(e) => setPrompt((e.target as HTMLInputElement).value)}
          disabled={isForging}
          label="Prompt"
        />
        <Input
          placeholder="Context"
          value={context}
          onChange={(e) => setContext((e.target as HTMLInputElement).value)}
          disabled={isForging}
          label="Context"
        />

        <Button onClick={handleGenerate} disabled={!prompt.trim() || isForging} className="w-full">
          {isForging ? 'Forging Luxury...' : 'Forgé Component'}
        </Button>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <>
            <Card className="mt-4 p-4" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', borderColor: '#D4AF37' }}>
              <Card.Header>
                <h3 className="font-semibold">Luxury Results</h3>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-3xl font-bold">{result.finalScore}</p>
                    <p className="text-xs text-muted-foreground">Luxury Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{result.iterations}</p>
                    <p className="text-xs text-muted-foreground">Iterations</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="mt-4" style={{ borderColor: '#D4AF37' }}>
              <Card.Header>
                <h3 className="font-semibold">Final Approved Code</h3>
              </Card.Header>
              <Card.Body>
                <pre className="bg-black/50 p-3 rounded text-sm overflow-x-auto text-zinc-100 max-h-96 overflow-y-auto">
                  {result.finalCode}
                </pre>
              </Card.Body>
              <Card.Footer>
                <Button
                  onClick={() => {
                    void navigator.clipboard.writeText(result.finalCode);
                    toast.success('Code copied to clipboard');
                  }}
                  aria-label="Copy code"
                >
                  Copy Code
                </Button>
              </Card.Footer>
            </Card>

            {result.critiqueHistory.length > 0 && (
              <Card className="mt-4">
                <Card.Header>
                  <h3 className="font-semibold">Refinement Iterations</h3>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-2 text-sm">
                    {result.critiqueHistory.map((item, idx) => (
                      <div key={idx} className="p-3 rounded border border-border bg-card">
                        <p className="font-medium">Iteration {item.iteration}</p>
                        <p className="font-semibold">{item.score}/100</p>
                        <p className="text-muted-foreground text-xs line-clamp-2">{item.assessment}</p>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};
