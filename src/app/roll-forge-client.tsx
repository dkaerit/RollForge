'use client';

import { useState, useTransition } from 'react';
import type { DiceCombination } from '@/components/roll-forge/types';
import { CombinationGenerator } from '@/components/roll-forge/combination-generator';
import { ResultsDisplay } from '@/components/roll-forge/results-display';
import { CombinationAnalysisDialog } from '@/components/roll-forge/combination-analysis-dialog';
import { generateCombinationsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function RollForgeClient() {
  const [isPending, startTransition] = useTransition();
  const [combinations, setCombinations] = useState<DiceCombination[]>([]);
  const [selectedCombination, setSelectedCombination] =
    useState<DiceCombination | null>(null);
  const { toast } = useToast();

  const handleGenerate = (
    minRoll: number,
    maxRoll: number,
    availableDice: string[]
  ) => {
    startTransition(async () => {
      const result = await generateCombinationsAction({
        minRoll,
        maxRoll,
        availableDice,
      });
      if (result?.combinations) {
        setCombinations(result.combinations);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            'Could not generate combinations. Please try again later.',
        });
        setCombinations([]);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 sm:p-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <h1 className="text-3xl font-headline font-bold text-primary">
          RollForge
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-powered dice combination generator & analyzer
        </p>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <CombinationGenerator
              onGenerate={handleGenerate}
              isPending={isPending}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <ResultsDisplay
              combinations={combinations}
              onSelect={setSelectedCombination}
              isPending={isPending}
            />
          </div>
        </div>
      </main>
      {selectedCombination && (
        <CombinationAnalysisDialog
          combination={selectedCombination}
          open={!!selectedCombination}
          onOpenChange={(isOpen) => !isOpen && setSelectedCombination(null)}
        />
      )}
      <footer className="text-center p-4 text-xs text-muted-foreground border-t border-border/50">
        Built with Next.js and Genkit.
      </footer>
    </div>
  );
}
