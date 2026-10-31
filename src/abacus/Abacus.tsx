import type { CSSProperties } from "react";
import { MARKER_RODS, type Rod } from "./model";

// Drawing units (the SVG scales to fit the screen, so these are relative).
const ROD_SPACING = 40;
const FRAME = 16;
const BEAD_WIDTH = 34;
export const BEAD_HEIGHT = 20;
const GAP = 3; // space between a bead and the beam or frame
const BEAM = 10;

// Each deck has room for its beads plus one empty bead slot, so beads at
// rest are always clearly apart from beads on the beam.
const UPPER_DECK = 2 * BEAD_HEIGHT + 2 * GAP;
const LOWER_DECK = 5 * BEAD_HEIGHT + 2 * GAP;

const BEAM_TOP = FRAME + UPPER_DECK;
const BEAM_BOTTOM = BEAM_TOP + BEAM;
const LOWER_FRAME_TOP = BEAM_BOTTOM + LOWER_DECK;

const COLORS = {
  frame: "#5b3415",
  board: "#f4e6c8",
  rod: "#9a7b55",
  beam: "#3a2210",
  marker: "#fdf6e3",
  beadOnBeam: "#a8431a",
  beadAtRest: "#c98a52",
  beadEdge: "#4a2410",
};

/** Vanish mode: beads can fade out and then be left out entirely. */
export type BeadVisibility = "shown" | "fading" | "hidden";

interface AbacusProps {
  rods: Rod[];
  beads?: BeadVisibility;
  /** How long the fade takes, when `beads` is "fading". */
  fadeMs?: number;
}

export default function Abacus({
  rods,
  beads = "shown",
  fadeMs = 0,
}: AbacusProps) {
  const width = 2 * FRAME + rods.length * ROD_SPACING;
  const height = LOWER_FRAME_TOP + FRAME;

  return (
    <svg
      className={beads === "fading" ? "abacus beads-fading" : "abacus"}
      style={{ "--bead-fade": `${fadeMs}ms` } as CSSProperties}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Abacus"
    >
      <rect width={width} height={height} rx={8} fill={COLORS.frame} />
      <rect
        x={FRAME}
        y={FRAME}
        width={width - 2 * FRAME}
        height={height - 2 * FRAME}
        fill={COLORS.board}
      />

      {rods.map((rod, index) => (
        <RodDrawing
          key={index}
          rod={rod}
          beadsHidden={beads === "hidden"}
          x={FRAME + (index + 0.5) * ROD_SPACING}
        />
      ))}

      <rect
        x={FRAME}
        y={BEAM_TOP}
        width={width - 2 * FRAME}
        height={BEAM}
        fill={COLORS.beam}
      />
      {MARKER_RODS.map((rodNumber) => (
        <circle
          key={rodNumber}
          data-testid="marker"
          data-rod={rodNumber}
          cx={FRAME + (rodNumber - 0.5) * ROD_SPACING}
          cy={BEAM_TOP + BEAM / 2}
          r={2.5}
          fill={COLORS.marker}
        />
      ))}
    </svg>
  );
}

function RodDrawing({
  rod,
  x,
  beadsHidden,
}: {
  rod: Rod;
  x: number;
  beadsHidden: boolean;
}) {
  // Upper bead: against the beam when on, against the top frame at rest.
  const upperY = rod.upper
    ? BEAM_TOP - GAP - BEAD_HEIGHT / 2
    : FRAME + GAP + BEAD_HEIGHT / 2;

  // Lower beads, numbered from the beam down. The first `rod.lower` beads
  // stack against the beam; the rest stack against the bottom frame.
  const lowerYs = [0, 1, 2, 3].map((i) =>
    i < rod.lower
      ? BEAM_BOTTOM + GAP + BEAD_HEIGHT / 2 + i * BEAD_HEIGHT
      : LOWER_FRAME_TOP - GAP - BEAD_HEIGHT / 2 - (3 - i) * BEAD_HEIGHT,
  );

  return (
    <g data-testid="rod">
      <line
        x1={x}
        y1={FRAME}
        x2={x}
        y2={LOWER_FRAME_TOP}
        stroke={COLORS.rod}
        strokeWidth={2}
      />
      {!beadsHidden && (
        <>
          <Bead kind="upper" x={x} y={upperY} onBeam={rod.upper} />
          {lowerYs.map((y, i) => (
            <Bead key={i} kind="lower" x={x} y={y} onBeam={i < rod.lower} />
          ))}
        </>
      )}
    </g>
  );
}

/** A soroban bead seen from the side: a flattened diamond. */
function Bead({
  kind,
  x,
  y,
  onBeam,
}: {
  kind: "upper" | "lower";
  x: number;
  y: number;
  onBeam: boolean;
}) {
  const w = BEAD_WIDTH / 2;
  const h = BEAD_HEIGHT / 2 - 0.5;
  const flat = w * 0.35; // width of the flat top and bottom
  const points = [
    [x - w, y],
    [x - flat, y - h],
    [x + flat, y - h],
    [x + w, y],
    [x + flat, y + h],
    [x - flat, y + h],
  ]
    .map((p) => p.join(","))
    .join(" ");

  return (
    <polygon
      data-bead={kind}
      data-on-beam={onBeam}
      data-y={y}
      points={points}
      fill={onBeam ? COLORS.beadOnBeam : COLORS.beadAtRest}
      stroke={COLORS.beadEdge}
      strokeWidth={1}
    />
  );
}
