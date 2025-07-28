'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiceCombination } from './types';
import { Badge } from '@/components/ui/badge';
import { DiceIcon } from './dice-icon';
import { useLanguage } from '@/context/language-context';
import { Ruler, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const getDistributionColor = (score: number) => {
    if (score > 1.2) {
      return 'bg-red-500/20 text-red-400 border-red-500/30'; // bell-shaped
    }
    if (score > 0.4) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; // somewhat bell-shaped
    }
    return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'; // flat
  };

  const getFitColor = (score: number) => {
    if (score >= 95) {
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
    if (score >= 75) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

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
        <h2 className="mt-6 text-2xl font-headline">
          {t('resultsWaitingTitle')}
        </h2>
        <p className="mt-2 text-muted-foreground max-w-sm">
          {t('resultsWaitingDescription')}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
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
                <Badge variant="outline">
                  {t('minLabel')}: {combo.min}
                </Badge>
                <Badge variant="outline">
                  {t('maxLabel')}: {combo.max}
                </Badge>
                <Badge variant="outline">
                  {t('avgLabel')}: {combo.average.toFixed(2)}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className={cn('gap-1.5', getFitColor(combo.fitScore))}
                    >
                      <Ruler className="h-3 w-3" />{' '}
                      {t(combo.fitDescription)} ({combo.fitScore.toFixed(0)}%)
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(`${combo.fitDescription}.tooltip`)}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        'gap-1.5',
                        getDistributionColor(combo.distributionScore)
                      )}
                    >
                      <BarChart3 className="h-3 w-3" />
                      {t(combo.distributionShape)} (
                      {combo.distributionScore.toFixed(2)})
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(`${combo.distributionShape}.tooltip`)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {t('clickToAnalyze')}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
