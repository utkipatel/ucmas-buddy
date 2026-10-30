/** A fake Math.random that returns the given values in order, then repeats. */
export function fakeRandom(...values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
}
