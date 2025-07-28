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
        <h2 className="mt-6 text-2xl font-headline">Awaiting Your Command</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Use the generator to forge dice combinations. Your results will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-headline text-primary">
        Forged Combinations
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
              <Badge variant="outline">Min: {combo.min}</Badge>
              <Badge variant="outline">Max: {combo.max}</Badge>
              <Badge variant="outline">Avg: {combo.average.toFixed(2)}</Badge>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Click to analyze
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
