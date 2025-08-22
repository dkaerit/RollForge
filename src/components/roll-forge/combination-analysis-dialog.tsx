'use client';

import { useEffect, useState, useTransition, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { analyzeCombinationAction } from '@/app/actions';
import {
  runSimulation,
  formatSimulationDataForChart,
  simulateRoll,
  calculateTheoreticalDistribution,
  parseDiceString,
  getCombinationStats,
  type SimulationResult,
} from '@/lib/dice-utils';
import { Button } from '@/components/ui/button';
import type { DiceCombination } from './types';
import type { AnalyzeDiceCombinationOutput } from '@/ai/flows/analyze-dice-combination';
import { useToast } from '@/hooks/use-toast';
import { AnimatedNumber } from './animated-number';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language-context';
import { DiceIcon } from '@/components/roll-forge/dice-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CombinationAnalysisDialogProps {
  combination: DiceCombination;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SIMULATION_COUNT = 10000;

export function CombinationAnalysisDialog({
  combination,
  open,
  onOpenChange,
}: CombinationAnalysisDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] =
    useState<AnalyzeDiceCombinationOutput | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const chartData = useMemo(() => {
    const parsed = parseDiceString(combination.dice);
    const isSingleDie = parsed.dice.length === 1 && parsed.dice[0].count === 1 && parsed.dice[0].sides !== 'F';

    let results: Record<number, number>;
    if (isSingleDie) {
      results = calculateTheoreticalDistribution(combination.dice, SIMULATION_COUNT);
    } else {
      results = runSimulation(combination.dice, SIMULATION_COUNT);
    }
    return formatSimulationDataForChart(results);
  }, [combination.dice]);

  useEffect(() => {
    let isCancelled = false;
    if (open) {
      setAnalysis(null);
      setSimulationResult(null);
      startTransition(async () => {
        const result = await analyzeCombinationAction({
          diceCombination: combination.dice,
          language: language,
        });

        if (isCancelled) return;
        
        if (result) {
          setAnalysis(result);
        } else {
          toast({
            variant: 'destructive',
            title: t('analysisFailedTitle'),
            description: t('analysisFailedDescription'),
          });
        }
      });
    }
    return () => {
      isCancelled = true;
    }
  }, [open, combination, toast, t, language]);
  
  const handleSimulateRoll = () => {
    setSimulationResult(simulateRoll(combination.dice));
  };
  
  const translatedAnalysis = useMemo(() => {
    if (!analysis) return null;

    const stats = getCombinationStats(combination.dice);
    const options = {
      min: stats.min,
      max: stats.max,
      average: stats.average.toFixed(2),
    };
    
    return {
        analysis: t(analysis.analysis, options),
        probabilityDistribution: t(analysis.probabilityDistribution, options),
        simulationResults: t(analysis.simulationResults, options)
    }
  }, [analysis, t, combination.dice]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <ScrollArea className="h-full pr-6">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            {t('analysisTitle')}: <span className="font-mono text-accent">{combination.dice}</span>
          </DialogTitle>
          <DialogDescription>
            {t('analysisSubtitle')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('liveSimulationTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <TooltipProvider>
               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col gap-2 items-center justify-center p-2 rounded-lg bg-background w-full min-h-[80px]">
                      {simulationResult && (
                         <div className="flex flex-col gap-2 text-sm w-full font-mono">
                           <div className="flex flex-wrap items-center gap-2">
                            {simulationResult.individualRolls.map((roll, index) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                                        <DiceIcon sides={typeof roll.sides === 'number' ? roll.sides : 0} className="w-5 h-5" />
                                        <span>{roll.result}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>d{roll.sides}</p>
                                  </TooltipContent>
                                </Tooltip>
                            ))}
                            </div>
                            {simulationResult.modifier !== 0 && (
                                <div className="flex items-center gap-2 p-1">
                                    <span className="w-5 h-5 flex items-center justify-center text-accent font-bold">#</span>
                                    <span>{simulationResult.modifier > 0 ? `+ ${simulationResult.modifier}` : `- ${Math.abs(simulationResult.modifier)}`}</span>
                                </div>
                            )}
                         </div>
                      )}
                  </div>
                  <div className="flex items-center justify-center p-4 rounded-lg bg-background w-full min-h-[80px]">
                    <AnimatedNumber value={simulationResult?.total ?? null} />
                  </div>
               </div>
              </TooltipProvider>
                <Button onClick={handleSimulateRoll} className="w-full">{t('rollTheDice')}</Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('probabilityDistributionTitle')}</CardTitle>
              <CardDescription>{t('probabilityDistributionSubtitle', { count: SIMULATION_COUNT.toLocaleString() })}</CardDescription>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="roll" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))'
                    }}
                  />
                  <Bar dataKey="frequency" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
         <div className="mt-6">
            <h3 className="font-headline text-xl text-primary mb-4">{t('aiAnalysisTitle')}</h3>
            {isPending && !translatedAnalysis ? (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : (
                <div className="space-y-4 text-sm">
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">{t('overallAnalysisTitle')}</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm prose-invert max-w-none text-muted-foreground"><p>{translatedAnalysis?.analysis}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">{t('probabilityInsightsTitle')}</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm prose-invert max-w-none text-muted-foreground"><p>{translatedAnalysis?.probabilityDistribution}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">{t('simulationAnalysisTitle')}</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm prose-invert max-w-none text-muted-foreground"><p>{translatedAnalysis?.simulationResults}</p></CardContent>
                    </Card>
                </div>
            )}
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
