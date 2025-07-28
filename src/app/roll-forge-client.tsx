'use client';

import { useState, useTransition, useMemo, useCallback } from 'react';
import type { DiceCombination } from '@/components/roll-forge/types';
import { CombinationGenerator } from '@/components/roll-forge/combination-generator';
import { ResultsDisplay, type SortKey, type SortDirection } from '@/components/roll-forge/results-display';
import { CombinationAnalysisDialog } from '@/components/roll-forge/combination-analysis-dialog';
import { generateCombinationsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/roll-forge/language-switcher';
import { parseDiceString } from '@/lib/dice-utils';

export type SortCriterion = {
  key: SortKey;
  direction: SortDirection;
};


export function RollForgeClient() {
  const [isPending, startTransition] = useTransition();
  const [combinations, setCombinations] = useState<DiceCombination[]>([]);
  const [selectedCombination, setSelectedCombination] =
    useState<DiceCombination | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([
    { key: 'fitScore', direction: 'desc' },
    { key: 'distributionScore', direction: 'asc' },
  ]);

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
            const variety = new Set(parsed.dice.map(d => d.sides)).size;

            let avgSides = 0;
            if (numDice > 0) {
                avgSides = parsed.dice.reduce((sum, d) => {
                    const sides = d.sides === 'F' ? 3 : (d.sides === 2 ? 2 : d.sides);
                    return sum + (sides * d.count);
                }, 0) / numDice;
            }

            let distributionScore = 0;
            if (numDice > 1) {
                // Base score on number of dice (more dice = more bell-like)
                const baseScore = Math.log(numDice) * 2;
                // Bonus for variety
                const varietyBonus = variety > 1 ? 0.5 : 0;
                // Penalty for high-sided dice (more sides = flatter)
                const sidesPenalty = Math.max(0, (avgSides - 8) / 20) * 0.8;
                distributionScore = Math.max(0, baseScore + varietyBonus - sidesPenalty);
            } else if (numDice === 1) {
                distributionScore = 0;
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

  const handleSetSortPriority = useCallback((key: SortKey) => {
    setSortCriteria(prev => {
        const newPrimary = prev.find(c => c.key === key);
        if (!newPrimary) return prev; // Should not happen

        const otherCriteria = prev.filter(c => c.key !== key);
        return [newPrimary, ...otherCriteria];
    });
  }, []);

  const handleToggleSortDirection = useCallback((key: SortKey) => {
    setSortCriteria(prev => prev.map(c => 
        c.key === key 
            ? { ...c, direction: c.direction === 'desc' ? 'asc' : 'desc' } 
            : c
    ));
  }, []);
  
  const sortedCombinations = useMemo(() => {
    return [...combinations].sort((a, b) => {
      for (const criterion of sortCriteria) {
        const { key, direction } = criterion;
        let valA = a[key];
        let valB = b[key];

        // For distribution, we want lower scores (flatter) to be "desc" by default.
        // So we flip the logic if the direction is asc.
        if (key === 'distributionScore') {
          if (direction === 'asc') {
            [valA, valB] = [valB, valA];
          }
        } else {
           if (direction === 'desc') {
            [valA, valB] = [valB, valA];
          }
        }

        if (valA < valB) return -1;
        if (valA > valB) return 1;
      }
      return 0;
    });
  }, [combinations, sortCriteria]);

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
              combinations={sortedCombinations}
              onSelect={setSelectedCombination}
              isPending={isPending}
              sortCriteria={sortCriteria}
              onSetSortPriority={handleSetSortPriority}
              onToggleSortDirection={handleToggleSortDirection}
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
