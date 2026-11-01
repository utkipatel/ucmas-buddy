import { describe, expect, it } from "vitest";
import { firstNumber, parseSpokenNumber } from "./spokenNumber";

describe("parseSpokenNumber (AC5)", () => {
  it.each([
    ["412", 412],
    ["4,120", 4120],
    ["4 1 2", 412],
    ["41 2", 412],
    ["4 120", 4120],
    ["500 3", 5003],
    ["999999", 999999],
    ["0", 0],
  ])("reads digits like a typed answer: %j", (text, expected) => {
    expect(parseSpokenNumber(text)).toBe(expected);
  });

  it.each([
    ["seven", 7],
    ["zero", 0],
    ["oh", 0],
    ["thirteen", 13],
    ["forty", 40],
    ["forty-two", 42],
    ["forty two", 42],
    ["one hundred", 100],
    ["a hundred", 100],
    ["four hundred twelve", 412],
    ["four hundred and twelve", 412],
    ["nine hundred ninety-nine", 999],
    ["a thousand", 1000],
    ["two thousand and five", 2005],
    ["twelve thousand three hundred forty-five", 12345],
    ["nine hundred ninety-nine thousand nine hundred ninety-nine", 999999],
    ["fifteen hundred", 1500],
    ["twenty five hundred", 2500],
    ["twelve hundred thirty four", 1234],
    ["one hundred oh five", 105],
  ])("reads words: %j", (text, expected) => {
    expect(parseSpokenNumber(text)).toBe(expected);
  });

  it.each([
    ["four one two", 412],
    ["one oh five", 105],
    ["4 one", 41],
  ])("reads single digits one by one: %j", (text, expected) => {
    expect(parseSpokenNumber(text)).toBe(expected);
  });

  it.each([
    ["4 hundred", 400],
    ["4 hundred 12", 412],
    ["2 thousand 5", 2005],
    ["12 thousand 345", 12345],
  ])("reads mixes of digits and words: %j", (text, expected) => {
    expect(parseSpokenNumber(text)).toBe(expected);
  });

  it.each([
    ["for", 4],
    ["fore", 4],
    ["to", 2],
    ["too", 2],
    ["won", 1],
    ["ate", 8],
    ["tree", 3],
    ["to hundred", 200],
  ])("reads sound-alikes: %j", (text, expected) => {
    expect(parseSpokenNumber(text)).toBe(expected);
  });

  it("ignores case, extra spaces and end punctuation", () => {
    expect(parseSpokenNumber("  Forty-Two. ")).toBe(42);
    expect(parseSpokenNumber("412?")).toBe(412);
  });

  it("ignores punctuation between words", () => {
    expect(parseSpokenNumber("Four, one, two.")).toBe(412);
    expect(parseSpokenNumber("4, 1, 2")).toBe(412);
    expect(parseSpokenNumber("forty, two")).toBe(42);
  });
});

describe("parseSpokenNumber: not a number (AC6)", () => {
  it.each([
    "",
    "   ",
    "um",
    "what",
    "four apples",
    "a",
    "and",
    "hundred",
    "thousand",
    "twenty twenty",
    "twelve three",
    "fifteen hundred thousand",
    "four hundred hundred",
    "five thousand thousand",
    "1,000,000",
    "1234567",
    "one two three four five six seven",
    "3.5",
    "-4",
    "constructor",
  ])("returns null for %j", (text) => {
    expect(parseSpokenNumber(text)).toBeNull();
  });
});

describe("firstNumber", () => {
  it("uses the first guess that reads as a number", () => {
    expect(firstNumber(["for apples", "for", "4"])).toBe(4);
  });

  it("returns null when no guess is a number", () => {
    expect(firstNumber(["um", "hmm"])).toBeNull();
    expect(firstNumber([])).toBeNull();
  });
});
