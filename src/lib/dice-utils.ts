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
  sign: 1 | -1;
}

export interface ParsedMacro {
  dice: ParsedDice[];
  modifier: number;
}

export interface IndividualRoll {
    sides: number | 'F';
    result: number;
    sign: 1 | -1;
}

export interface SimulationResult {
    total: number;
    individualRolls: IndividualRoll[];
    modifier: number;
}

export function parseDiceString(macro: string): ParsedMacro {
  const normalizedMacro = macro.replace(/\s/g, '').replace(/^-/, '-1*');
  const parts = normalizedMacro.split(/(?=[+-])/);
  const result: ParsedMacro = { dice: [], modifier: 0 };

  const dieRegex = /(\d*)d(\d+|F)/i;

  for (const part of parts) {
    const trimmedPart = part.trim();
    const sign: 1 | -1 = trimmedPart.startsWith('-') ? -1 : 1;
    const partWithoutSign = trimmedPart.replace(/^[+-]/, '');

    const dieMatch = partWithoutSign.match(dieRegex);

    if (dieMatch) {
       const count = dieMatch[1] ? parseInt(dieMatch[1], 10) : 1;
       const sides = dieMatch[2].toUpperCase() === 'F' ? 'F' : parseInt(dieMatch[2], 10);
      result.dice.push({
        count: count,
        sides: sides,
        sign: sign
      });
    } else {
      result.modifier += (parseInt(trimmedPart, 10) || 0);
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
            min += die.count * (die.sign === 1 ? -1 : 1);
            max += die.count * (die.sign === 1 ? 1 : -1);
            // average doesn't change for fudge dice
        } else if (die.sides === 2) { // d2 (0-1)
            if (die.sign === 1) {
                min += die.count * 0;
                max += die.count * 1;
            } else {
                min -= die.count * 1;
                max -= die.count * 0;
            }
            average += die.count * 0.5 * die.sign;
        } else if (typeof die.sides === 'number') {
            if (die.sign === 1) {
                min += die.count * 1;
                max += die.count * die.sides;
            } else {
                min -= die.count * die.sides;
                max -= die.count * 1;
            }
            average += die.count * ((die.sides + 1) / 2) * die.sign;
        }
    }
    return { min, max, average };
}


export function simulateRoll(macro: string): SimulationResult {
  const { dice, modifier } = parseDiceString(macro);
  let total = modifier;
  const individualRolls: IndividualRoll[] = [];

  for (const die of dice) {
    for (let i = 0; i < die.count; i++) {
        let result = 0;
        if (die.sides === 'F') {
            result = Math.floor(Math.random() * 3) - 1;
        } else if (die.sides === 2) {
            // Special case for d2 to be 0 or 1
            result = Math.floor(Math.random() * 2);
        } else if (typeof die.sides === 'number') {
            result = Math.floor(Math.random() * die.sides) + 1;
        }
        total += result * die.sign;
        individualRolls.push({ sides: die.sides, result, sign: die.sign });
    }
  }
  return { total, individualRolls, modifier };
}

export function runSimulation(
  macro: string,
  times: number
): Record<number, number> {
  const results: Record<number, number> = {};
  for (let i = 0; i < times; i++) {
    const roll = simulateRoll(macro).total;
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
    const die = dice[0];
    const sides = die.sides;
    const isD2 = sides === 2;
    const runsPerOutcome = totalRuns / (isD2 ? 2 : sides);
    
    if (isD2) {
        // Special case for d2 (0-1)
        results[0 * die.sign + modifier] = (results[0 * die.sign + modifier] || 0) + runsPerOutcome;
        results[1 * die.sign + modifier] = (results[1 * die.sign + modifier] || 0) + runsPerOutcome;
    } else {
        for (let i = 1; i <= sides; i++) {
          const roll = i * die.sign + modifier;
          results[roll] = (results[roll] || 0) + runsPerOutcome;
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
  const targetAvg = (minRoll + maxRoll) / 2;
  const targetRange = maxRoll - minRoll;

  const numericDice = availableDice
    .filter(d => d.startsWith('d') && d !== 'dF')
    .map(d => parseInt(d.slice(1), 10))
    .sort((a, b) => a - b);
  
  const addCombination = (comboStr: string) => {
     if (!comboStr) return;
     const stats = getCombinationStats(comboStr);
      combinations.push({
        dice: comboStr,
        min: stats.min,
        max: stats.max,
        average: stats.average
      });
  }

  // Strategy 1: Find the best single die + modifier
  for (const sides of numericDice) {
    if (sides === 2) continue; // Skip d2 for this strategy
    const baseAvg = (sides + 1) / 2;
    const modifier = Math.round(targetAvg - baseAvg);
    const comboStr = `1d${sides}${modifier > 0 ? '+' : ''}${modifier !== 0 ? modifier : ''}`;
    addCombination(comboStr);
  }

  // Strategy 2: Two identical dice to create a bell curve centered on the target
  for (const sides of numericDice) {
     if (sides === 2) continue;
     const baseAvg = 2 * ((sides + 1) / 2);
     const modifier = Math.round(targetAvg - baseAvg);
     const comboStr = `2d${sides}${modifier > 0 ? '+' : ''}${modifier !== 0 ? modifier : ''}`;
     addCombination(comboStr);
  }

  // Strategy 3: Find a die that matches the range, then add a modifier
  for (const sides of numericDice) {
      if (sides === 2) continue;
      const range = sides - 1;
      if (Math.abs(range - targetRange) < 5) { // If the die's range is close
          const baseMin = 1;
          const modifier = minRoll - baseMin;
          const comboStr = `1d${sides}${modifier > 0 ? '+' : ''}${modifier !== 0 ? modifier : ''}`;
          addCombination(comboStr);
      }
  }
  
  // Strategy 4: Use d2s to fill small gaps
  if (availableDice.includes('d2')) {
      for (const combo of combinations.slice(0, 5)) { // Iterate over a copy
          const stats = getCombinationStats(combo.dice);
          const maxDiff = maxRoll - stats.max;
          if (maxDiff > 0 && maxDiff <= 5) { // Add d2s if the gap is small
              const d2Count = Math.round(maxDiff);
              if (d2Count > 0) {
                 addCombination(`${combo.dice}+${d2Count}d2`);
              }
          }
           const minDiff = stats.min - minRoll;
           if (minDiff > 0 && minDiff <=3) { // Use negative d2s to lower min
                const d2Count = Math.round(minDiff);
                if (d2Count > 0) {
                    addCombination(`${combo.dice}-${d2Count}d2`);
                }
           }
      }
  }


  // Remove duplicates and limit to a reasonable number
  const uniqueCombinations = Array.from(new Map(combinations.map(item => [item.dice.replace(/\+[0]$/, ""), item])).values());

  // Sort by a simple score: how close is the average and range
  uniqueCombinations.sort((a, b) => {
      const aScore = Math.abs(a.average - targetAvg) + Math.abs((a.max - a.min) - targetRange);
      const bScore = Math.abs(b.average - targetAvg) + Math.abs((b.max - b.min) - targetRange);
      return aScore - bScore;
  });

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
