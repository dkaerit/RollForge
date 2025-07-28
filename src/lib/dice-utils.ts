import type {
  GenerateDiceCombinationsInput,
  GenerateDiceCombinationsOutput,
} from '@/ai/flows/generate-dice-combinations';
import type {
  AnalyzeDiceCombinationInput,
  AnalyzeDiceCombinationOutput,
} from '@/ai/flows/analyze-dice-combination';


export interface ParsedDice {
  count: number;
  sides: number | 'F';
}

export interface ParsedMacro {
  dice: ParsedDice[];
  modifier: number;
}

export function parseDiceString(macro: string): ParsedMacro {
  const parts = macro.replace(/\s/g, '').split(/(?=[+-])/);
  const result: ParsedMacro = { dice: [], modifier: 0 };

  const dieRegex = /(\d*)d(\d+|F)/i;

  for (const part of parts) {
    const trimmedPart = part.trim();
    const dieMatch = trimmedPart.match(dieRegex);

    if (dieMatch) {
       const count = dieMatch[1] ? parseInt(dieMatch[1], 10) : 1;
      const sides = dieMatch[2].toUpperCase() === 'F' ? 'F' : parseInt(dieMatch[2], 10);
      result.dice.push({
        count: count,
        sides: sides,
      });
    } else {
      result.modifier += parseInt(trimmedPart, 10) || 0;
    }
  }

  return result;
}

export function getCombinationStats(macro: string): { min: number, max: number, average: number } {
    const { dice, modifier } = parseDiceString(macro);
    let min = modifier;
    let max = modifier;
    let average = modifier;

    for (const die of dice) {
        if (die.sides === 'F') {
            min += die.count * -1;
            max += die.count * 1;
            average += die.count * 0;
        } else if (die.sides === 2) {
            // Special case for d2 to be 0 or 1
            min += die.count * 0;
            max += die.count * 1;
            average += die.count * 0.5;
        } else if (typeof die.sides === 'number') {
            min += die.count * 1;
            max += die.count * die.sides;
            average += die.count * ((die.sides + 1) / 2);
        }
    }
    return { min, max, average };
}


export function simulateRoll(macro: string): number {
  const { dice, modifier } = parseDiceString(macro);
  let total = modifier;

  for (const die of dice) {
    for (let i = 0; i < die.count; i++) {
        if (die.sides === 'F') {
            total += Math.floor(Math.random() * 3) - 1;
        } else if (die.sides === 2) {
            // Special case for d2 to be 0 or 1
            total += Math.floor(Math.random() * 2);
        } else if (typeof die.sides === 'number') {
            total += Math.floor(Math.random() * die.sides) + 1;
        }
    }
  }
  return total;
}

export function runSimulation(
  macro: string,
  times: number
): Record<number, number> {
  const results: Record<number, number> = {};
  for (let i = 0; i < times; i++) {
    const roll = simulateRoll(macro);
    results[roll] = (results[roll] || 0) + 1;
  }
  return results;
}

export function calculateTheoreticalDistribution(
  macro: string,
  totalRuns: number
): Record<number, number> {
  const { dice, modifier } = parseDiceString(macro);
  const results: Record<number, number> = {};
  
  if (dice.length === 1 && typeof dice[0].sides === 'number' && dice[0].count === 1) {
    const sides = dice[0].sides;
    const isD2 = sides === 2;
    const runsPerOutcome = totalRuns / (isD2 ? 2 : sides);
    
    if (isD2) {
        // Special case for d2 (0-1)
        results[0 + modifier] = runsPerOutcome;
        results[1 + modifier] = runsPerOutcome;
    } else {
        for (let i = 1; i <= sides; i++) {
          const roll = i + modifier;
          results[roll] = runsPerOutcome;
        }
    }
  }
  
  return results;
}

export function formatSimulationDataForChart(
  data: Record<number, number>
): { roll: number; frequency: number }[] {
  return Object.entries(data)
    .map(([roll, frequency]) => ({ roll: parseInt(roll, 10), frequency }))
    .sort((a, b) => a.roll - b.roll);
}

// Fallback generator
export function generateFallbackCombinations(
  input: GenerateDiceCombinationsInput
): GenerateDiceCombinationsOutput {
  const { minRoll, maxRoll, availableDice } = input;
  const combinations: GenerateDiceCombinationsOutput['combinations'] = [];
  const hasD2 = availableDice.includes('d2');

  const numericDice = availableDice
    .filter(d => d !== 'dF' && d !== 'd2')
    .map(d => parseInt(d.slice(1), 10))
    .sort((a, b) => a - b);
  
  // Simple case: try with one die + modifier
  for (const sides of numericDice) {
    const die = `1d${sides}`;
    const baseAvg = (sides + 1) / 2;

    const targetAvg = (minRoll + maxRoll) / 2;
    let modifier = Math.round(targetAvg - baseAvg);
    let finalDie = `${die}${modifier >= 0 ? '+' : ''}${modifier}`;
    
    if (hasD2) {
        const stats = getCombinationStats(finalDie);
        const maxDiff = maxRoll - stats.max;
        if (maxDiff > 0) {
            const d2Count = Math.round(maxDiff);
            if (d2Count > 0) {
                finalDie = `${finalDie}+${d2Count}d2`;
            }
        }
    }

    const stats = getCombinationStats(finalDie);
    combinations.push({
      dice: finalDie,
      min: stats.min,
      max: stats.max,
      average: stats.average
    });
  }

  // Case 2: try with two dice + modifier
  if (numericDice.length > 1) {
    for (let i = 0; i < numericDice.length; i++) {
        for (let j = i; j < numericDice.length; j++) {
            const sides1 = numericDice[i];
            const sides2 = numericDice[j];
            const die = `1d${sides1}+1d${sides2}`;
            
            const baseAvg = ((sides1 + 1) / 2) + ((sides2 + 1) / 2);
            
            const targetAvg = (minRoll + maxRoll) / 2;
            let modifier = Math.round(targetAvg - baseAvg);
            
            let finalDie = `${die}${modifier >= 0 ? '+' : ''}${modifier}`;
            
            if (hasD2) {
                const stats = getCombinationStats(finalDie);
                const maxDiff = maxRoll - stats.max;
                if (maxDiff > 0) {
                    const d2Count = Math.round(maxDiff);
                     if (d2Count > 0) {
                        finalDie = `${finalDie}+${d2Count}d2`;
                    }
                }
            }

            const stats = getCombinationStats(finalDie);
            combinations.push({
                dice: finalDie,
                min: stats.min,
                max: stats.max,
                average: stats.average
            });
        }
    }
  }

  // Remove duplicates and limit to a reasonable number
  const uniqueCombinations = Array.from(new Map(combinations.map(item => [item.dice.replace(/\+[0]$/, ""), item])).values());

  return { combinations: uniqueCombinations.slice(0, 10) };
}

// Fallback analysis generator
export function generateFallbackAnalysis(
  input: AnalyzeDiceCombinationInput
): AnalyzeDiceCombinationOutput {
  const { diceCombination } = input;
  const parsed = parseDiceString(diceCombination);
  const numDice = parsed.dice.reduce((sum, d) => sum + d.count, 0);

  const analysisKey = 'fallback.analysis';
  
  let probabilityDistributionKey;
  if (numDice > 2) {
    probabilityDistributionKey = 'fallback.probability.bell';
  } else if (numDice === 1) {
    probabilityDistributionKey = 'fallback.probability.flat';
  } else {
    probabilityDistributionKey = 'fallback.probability.somewhatBell';
  }

  const simulationResultsKey = 'fallback.simulation';

  return {
    analysis: analysisKey,
    probabilityDistribution: probabilityDistributionKey,
    simulationResults: simulationResultsKey,
  };
}
