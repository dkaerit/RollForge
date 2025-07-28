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
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { analyzeCombinationAction } from '@/app/actions';
import {
  runSimulation,
  formatSimulationDataForChart,
  simulateRoll,
} from '@/lib/dice-utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { DiceCombination } from './types';
import type { AnalyzeDiceCombinationOutput } from '@/ai/flows/analyze-dice-combination';
import { useToast } from '@/hooks/use-toast';
import { AnimatedNumber } from './animated-number';
import { ScrollArea } from '../ui/scroll-area';

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
  const [singleRoll, setSingleRoll] = useState<number | null>(null);
  const { toast } = useToast();

  const chartData = useMemo(() => {
    const simulationResults = runSimulation(combination.dice, SIMULATION_COUNT);
    return formatSimulationDataForChart(simulationResults);
  }, [combination.dice]);

  useEffect(() => {
    if (open) {
      setAnalysis(null);
      setSingleRoll(null);
      startTransition(async () => {
        const result = await analyzeCombinationAction({
          diceCombination: combination.dice,
          minRange: combination.min,
          maxRange: combination.max,
        });
        if (result) {
          setAnalysis(result);
        } else {
          toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'Could not get AI analysis for this combination.',
          });
        }
      });
    }
  }, [open, combination, toast]);
  
  const handleSimulateRoll = () => {
    setSingleRoll(simulateRoll(combination.dice));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <ScrollArea className="h-full pr-6">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            Analysis: <span className="font-mono text-accent">{combination.dice}</span>
          </DialogTitle>
          <DialogDescription>
            AI-powered insights and simulated probability for your dice combo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Live Simulation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center p-4 rounded-lg bg-background w-full min-h-[80px]">
                    <AnimatedNumber value={singleRoll} />
                </div>
                <Button onClick={handleSimulateRoll} className="w-full">Roll the dice!</Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Probability Distribution</CardTitle>
              <CardDescription>Based on {SIMULATION_COUNT.toLocaleString()} simulated rolls.</CardDescription>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="roll" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
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
            <h3 className="font-headline text-xl text-primary mb-4">AI Analysis</h3>
            {isPending && !analysis ? (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : (
                <div className="space-y-4 text-sm">
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">Overall Analysis</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm prose-invert max-w-none text-muted-foreground"><p>{analysis?.analysis}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">Probability Insights</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm prose-invert max-w-none text-muted-foreground"><p>{analysis?.probabilityDistribution}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">Simulation Analysis</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm prose-invert max-w-none text-muted-foreground"><p>{analysis?.simulationResults}</p></CardContent>
                    </Card>
                </div>
            )}
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
