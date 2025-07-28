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

  const dieRegex = /(\d+)d(\d+|F)/i;

  for (const part of parts) {
    const trimmedPart = part.trim();
    const dieMatch = trimmedPart.match(dieRegex);

    if (dieMatch) {
      const sides = dieMatch[2].toUpperCase() === 'F' ? 'F' : parseInt(dieMatch[2], 10);
      result.dice.push({
        count: parseInt(dieMatch[1], 10),
        sides: sides,
      });
    } else {
      result.modifier += parseInt(trimmedPart, 10) || 0;
    }
  }

  return result;
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

export function formatSimulationDataForChart(
  data: Record<number, number>
): { roll: number; frequency: number }[] {
  return Object.entries(data)
    .map(([roll, frequency]) => ({ roll: parseInt(roll, 10), frequency }))
    .sort((a, b) => a.roll - b.roll);
}
