'use client';

import { useState, useTransition } from 'react';
import type { DiceCombination } from '@/components/roll-forge/types';
import { CombinationGenerator } from '@/components/roll-forge/combination-generator';
import { ResultsDisplay } from '@/components/roll-forge/results-display';
import { CombinationAnalysisDialog } from '@/components/roll-forge/combination-analysis-dialog';
import { generateCombinationsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/roll-forge/language-switcher';
import { parseDiceString } from '@/lib/dice-utils';

export function RollForgeClient() {
  const [isPending, startTransition] = useTransition();
  const [combinations, setCombinations] = useState<DiceCombination[]>([]);
  const [selectedCombination, setSelectedCombination] =
    useState<DiceCombination | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

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
        const processedCombinations = result.combinations
          .filter(
            (combo): combo is Omit<DiceCombination, 'fitScore' | 'fitDescription' | 'distributionScore' | 'distributionShape'> =>
              combo &&
              typeof combo.dice === 'string' &&
              typeof combo.min === 'number' &&
              typeof combo.max === 'number' &&
              typeof combo.average === 'number'
          )
          .map((combo) => {
            const comboMin = combo.min;
            const comboMax = combo.max;
            
            // Calculate Fit Score
            const rangeDiff = maxRoll - minRoll;
            const deviation =
              Math.abs(minRoll - comboMin) + Math.abs(maxRoll - comboMax);
            let fitScore = 0;
            if (rangeDiff > 0) {
              fitScore = Math.max(0, (1 - deviation / rangeDiff) * 100);
            } else if (deviation === 0) {
              fitScore = 100;
            }

            // Determine Fit Description
            let fitDescription = 'fit.noOverlap';
            const isContained = comboMin >= minRoll && comboMax <= maxRoll;
            const isWider = comboMin < minRoll && comboMax > maxRoll;
            const isDisplacedLow = comboMin < minRoll && comboMax >= minRoll && comboMax <= maxRoll;
            const isDisplacedHigh = comboMin >= minRoll && comboMin <= maxRoll && comboMax > maxRoll;

            if (comboMin === minRoll && comboMax === maxRoll) {
                fitDescription = 'fit.perfect';
            } else if (isContained) {
                fitDescription = 'fit.contained';
            } else if (isWider) {
                fitDescription = 'fit.wider';
            } else if (isDisplacedLow) {
                fitDescription = 'fit.exceedsLow';
            } else if (isDisplacedHigh) {
                fitDescription = 'fit.exceedsHigh';
            } else {
                fitDescription = 'fit.noOverlap';
            }

            // Calculate Distribution Score
            const parsed = parseDiceString(combo.dice);
            const numDice = parsed.dice.reduce((sum, d) => sum + d.count, 0);
            const variety = parsed.dice.length;
            const avgSides = parsed.dice.reduce((sum, d) => {
                if (d.sides === 'F') return sum + 3 * d.count;
                if (d.sides === 2) return sum + 2 * d.count;
                return sum + d.sides * d.count;
            }, 0) / (numDice || 1);


            let distributionScore = 0;
             if (numDice > 1) {
                const baseScore = (numDice - 1) * 0.5;
                const varietyBonus = variety > 1 ? 0.3 : 0;
                const sidesPenalty = Math.max(0, (avgSides - 8) / 20);

                distributionScore = Math.min(2.0, baseScore + varietyBonus - sidesPenalty);
            }

            let distributionShape = 'distribution.flat';
            if (distributionScore > 1.2) {
              distributionShape = 'distribution.bell';
            } else if (distributionScore > 0.4) {
              distributionShape = 'distribution.somewhatBell';
            }

            return {
              ...combo,
              fitScore,
              fitDescription,
              distributionScore,
              distributionShape,
            };
          })
          .sort((a, b) => {
            const getSortCategory = (c: DiceCombination) => {
                if (c.fitScore === 100 && c.distributionShape === 'distribution.flat') return 1;
                if (c.fitScore >= 80 && c.distributionShape === 'distribution.flat') return 2;
                if (c.fitScore >= 80 && c.distributionShape === 'distribution.somewhatBell') return 3;
                if (c.fitScore <= 70 && c.distributionShape === 'distribution.flat') return 4;
                if (c.fitScore <= 70 && c.distributionShape === 'distribution.somewhatBell') return 5;
                if (c.fitScore <= 70 && c.distributionShape === 'distribution.bell') return 6;
                // Fallback for combinations that don't fit the main criteria
                // This will push intermediate fit scores (70-80) and bell distributions with high fit scores to the end.
                return 7;
            };

            const categoryA = getSortCategory(a);
            const categoryB = getSortCategory(b);

            if (categoryA !== categoryB) {
                return categoryA - categoryB;
            }

            // Secondary sorting: higher fit score is better
            if (b.fitScore !== a.fitScore) {
                return b.fitScore - a.fitScore;
            }
            
            // Tertiary sorting: lower distribution score is better (flatter)
            return a.distributionScore - b.distributionScore;
          });
        setCombinations(processedCombinations);
      } else {
        toast({
          variant: 'destructive',
          title: t('toastErrorTitle'),
          description: t('toastErrorDescription'),
        });
        setCombinations([]);
      }
    });
  };

  const handleManualSimulate = (combination: DiceCombination) => {
    setSelectedCombination(combination);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 sm:p-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">
            RollForge
          </h1>
          <p className="text-muted-foreground mt-1">{t('appSubtitle')}</p>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <CombinationGenerator
              onGenerate={handleGenerate}
              onSimulate={handleManualSimulate}
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
        {t('footerText')}
      </footer>
    </div>
  );
}
