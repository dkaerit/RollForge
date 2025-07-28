'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiceCombination } from './types';
import { Badge } from '@/components/ui/badge';
import { DiceIcon } from './dice-icon';
import { useLanguage } from '@/context/language-context';
import { Ruler, BarChart3 } from 'lucide-react';

interface ResultsDisplayProps {
  combinations: DiceCombination[];
  onSelect: (combination: DiceCombination) => void;
  isPending: boolean;
}

export function ResultsDisplay({
  combinations,
  onSelect,
  isPending,
}: ResultsDisplayProps) {
  const { t } = useLanguage();

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 mb-4" />
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="space-y-2 p-4">
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (combinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[400px] border border-dashed rounded-lg">
        <div className="flex gap-4 text-primary">
            <DiceIcon sides={20} className="w-12 h-12" />
            <DiceIcon sides={12} className="w-12 h-12" />
            <DiceIcon sides={8} className="w-12 h-12" />
        </div>
        <h2 className="mt-6 text-2xl font-headline">{t('resultsWaitingTitle')}</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">
          {t('resultsWaitingDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-headline text-primary">
        {t('forgedCombinationsTitle')}
      </h2>
      {combinations.map((combo, index) => (
        <Card
          key={index}
          className="hover:border-primary transition-colors cursor-pointer"
          onClick={() => onSelect(combo)}
        >
          <CardHeader>
            <CardTitle className="font-mono text-xl text-accent">
              {combo.dice}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{t('minLabel')}: {combo.min}</Badge>
              <Badge variant="outline">{t('maxLabel')}: {combo.max}</Badge>
              <Badge variant="outline">{t('avgLabel')}: {combo.average.toFixed(2)}</Badge>
              <Badge variant="secondary" className="gap-1.5"><Ruler className="h-3 w-3" /> {t(combo.fitDescription)}</Badge>
              <Badge variant="secondary" className="gap-1.5"><BarChart3 className="h-3 w-3" /> {t(combo.distributionShape)}</Badge>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {t('clickToAnalyze')}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
