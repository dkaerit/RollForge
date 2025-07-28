'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DiceIcon } from './dice-icon';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const availableDiceTypes = [4, 6, 8, 10, 12, 20];

const formSchema = z
  .object({
    minRoll: z.coerce
      .number()
      .min(1, 'Min roll must be at least 1.')
      .max(1000, 'Min roll cannot exceed 1000.'),
    maxRoll: z.coerce
      .number()
      .min(1, 'Max roll must be at least 1.')
      .max(1000, 'Max roll cannot exceed 1000.'),
  })
  .refine((data) => data.maxRoll >= data.minRoll, {
    message: 'Max roll must be greater than or equal to min roll.',
    path: ['maxRoll'],
  });

interface CombinationGeneratorProps {
  onGenerate: (
    minRoll: number,
    maxRoll: number,
    availableDice: string[]
  ) => void;
  isPending: boolean;
}

export function CombinationGenerator({
  onGenerate,
  isPending,
}: CombinationGeneratorProps) {
  const [selectedDice, setSelectedDice] = useState<string[]>([
    'd4',
    'd6',
    'd8',
    'd10',
    'd12',
    'd20',
  ]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { minRoll: 5, maxRoll: 15 },
  });

  function handleToggle(die: string) {
    setSelectedDice((prev) =>
      prev.includes(die) ? prev.filter((d) => d !== die) : [...prev, die]
    );
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (selectedDice.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Dice Selected',
        description: 'Please select at least one die type to generate combinations.',
      });
      return;
    }
    onGenerate(values.minRoll, values.maxRoll, selectedDice);
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline">Generator Controls</CardTitle>
        <CardDescription>
          Define your target roll range and select available dice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minRoll"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Roll</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxRoll"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Roll</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Available Dice</FormLabel>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {availableDiceTypes.map((sides) => {
                  const die = `d${sides}`;
                  const isSelected = selectedDice.includes(die);
                  return (
                    <Button
                      key={sides}
                      type="button"
                      variant={isSelected ? 'secondary' : 'outline'}
                      onClick={() => handleToggle(die)}
                      className="flex items-center justify-center gap-2"
                    >
                      <DiceIcon sides={sides} className="h-5 w-5" />
                      {die}
                    </Button>
                  );
                })}
              </div>
            </FormItem>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Forge Combinations
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
