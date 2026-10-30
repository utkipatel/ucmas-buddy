import Abacus from "./abacus/Abacus";
import { numberToRods } from "./abacus/model";

// Temporary: shows a fixed number until the study screen (task #16) arrives.
const SAMPLE_NUMBER = 342;

export default function App() {
  return (
    <>
      <h1>UCMAS Buddy</h1>
      <Abacus rods={numberToRods(SAMPLE_NUMBER)} />
    </>
  );
}
