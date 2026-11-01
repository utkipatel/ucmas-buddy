/**
 * Reads what the speech recognizer heard as a number. The browser may
 * write a number as digits ("412") or words ("four hundred twelve"), so
 * both are understood. See docs/specs/004-voice-input/spec.md, F3.
 */
import { parseAnswer } from "../practice/session";

/** The largest number read; the longest numbers shown have 6 digits. */
const MAX_NUMBER = 999_999;

/** Words for 0-90, including common sound-alikes of digits. */
const WORD_VALUES = new Map<string, number>([
  ["zero", 0],
  ["oh", 0],
  ["one", 1],
  ["won", 1],
  ["two", 2],
  ["to", 2],
  ["too", 2],
  ["three", 3],
  ["tree", 3],
  ["four", 4],
  ["for", 4],
  ["fore", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["ate", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12],
  ["thirteen", 13],
  ["fourteen", 14],
  ["fifteen", 15],
  ["sixteen", 16],
  ["seventeen", 17],
  ["eighteen", 18],
  ["nineteen", 19],
  ["twenty", 20],
  ["thirty", 30],
  ["forty", 40],
  ["fifty", 50],
  ["sixty", 60],
  ["seventy", 70],
  ["eighty", 80],
  ["ninety", 90],
]);

/** A word or digits that were heard, read as a number or a multiplier. */
type Token = number | "hundred" | "thousand" | "a";

/** The number in what was said, or null if it isn't a number. */
export function parseSpokenNumber(text: string): number | null {
  const n = parseAnswer(text) ?? parseWords(text);
  return n !== null && n <= MAX_NUMBER ? n : null;
}

/** The first of the browser's guesses that reads as a number. */
export function firstNumber(alternatives: string[]): number | null {
  for (const text of alternatives) {
    const n = parseSpokenNumber(text);
    if (n !== null) {
      return n;
    }
  }
  return null;
}

/** Reads number words, possibly mixed with digits: "4 hundred twelve". */
function parseWords(text: string): number | null {
  const tokens = tokenize(text);
  if (tokens === null || tokens.length === 0) {
    return null;
  }

  // "four one two" or "4 one": single digits said one by one.
  if (tokens.length > 1 && tokens.every(isSingleDigit)) {
    return Number(tokens.join(""));
  }

  return new Reader(tokens).readWholeNumber();
}

/** Splits text into tokens, or returns null if a word isn't a number. */
function tokenize(text: string): Token[] | null {
  const words = text
    .toLowerCase()
    .replace(/([a-z])-(?=[a-z])/g, "$1 ") // "forty-two" -> "forty two"
    // Punctuation the browser may add, such as "Four, one, two." A dot
    // inside digits ("3.5") stays, so that isn't read as a number.
    .replace(/[,?!;:]|\.(?!\d)/g, " ")
    .split(/\s+/)
    .filter((w) => w !== "" && w !== "and");

  const tokens: Token[] = [];
  for (const word of words) {
    const value = WORD_VALUES.get(word);
    if (/^\d+$/.test(word)) {
      tokens.push(Number(word));
    } else if (value !== undefined) {
      tokens.push(value);
    } else if (word === "hundred" || word === "thousand" || word === "a") {
      tokens.push(word);
    } else {
      return null;
    }
  }
  return tokens;
}

function isSingleDigit(token: Token): boolean {
  return typeof token === "number" && token <= 9;
}

/**
 * Reads tokens in order as one whole number, such as "twelve thousand
 * three hundred forty five" or "fifteen hundred". Each read method
 * returns null if the tokens don't fit.
 */
class Reader {
  private i = 0;

  constructor(private readonly tokens: Token[]) {}

  /** The whole number, or null if any token is left over or out of place. */
  readWholeNumber(): number | null {
    let total = this.readBelowThousand();
    if (this.peek() === "thousand") {
      if (total === null || total === 0 || total > 999) {
        return null;
      }
      this.i++;
      total = total * 1000 + (this.readBelowThousand() ?? 0);
    }
    return this.i === this.tokens.length ? total : null;
  }

  /**
   * Usually 0-999, such as "four hundred twelve" or "412". "Fifteen
   * hundred" gives 1500; the caller checks the size.
   */
  private readBelowThousand(): number | null {
    const first = this.peek();
    let value: number;
    if (first === "a") {
      // "a hundred" or "a thousand", but not "a" alone.
      const next = this.tokens[this.i + 1];
      if (next !== "hundred" && next !== "thousand") {
        return null;
      }
      this.i++;
      value = 1;
    } else if (typeof first === "number" && first <= 999) {
      this.i++;
      value = this.withOnes(first);
    } else {
      return null;
    }

    if (this.peek() === "hundred") {
      if (value < 1 || value > 99) {
        return null;
      }
      this.i++;
      return value * 100 + (this.readBelowHundred() ?? 0);
    }
    return value;
  }

  /** 1-99 after "hundred": "twelve", "forty two", or "oh five". */
  private readBelowHundred(): number | null {
    const first = this.peek();
    const next = this.tokens[this.i + 1];
    if (first === 0 && typeof next === "number" && next >= 1 && next <= 9) {
      this.i += 2;
      return next;
    }
    if (typeof first !== "number" || first < 1 || first > 99) {
      return null;
    }
    this.i++;
    return this.withOnes(first);
  }

  /** Adds a following digit to a tens word: "forty" "two" is 42. */
  private withOnes(value: number): number {
    const next = this.peek();
    const isTens = value >= 20 && value <= 90 && value % 10 === 0;
    if (isTens && typeof next === "number" && next >= 1 && next <= 9) {
      this.i++;
      return value + next;
    }
    return value;
  }

  private peek(): Token | undefined {
    return this.tokens[this.i];
  }
}
