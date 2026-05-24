/* ═══════════════════════════════════════════
   MRT MAP LAYOUT CONFIG
   All positional / dimensional constants for
   LinearMap and ForkMap live here.
═══════════════════════════════════════════ */

/* ── Shared ─────────────────────────────── */
const MAP_GAP    = 160;   // px between adjacent station centres
const MAP_PAD_X  = 220;   // left/right padding inside the SVG

/* ── LinearMap (single straight track) ──── */
const LINEAR_SVG_H  = 520;   // total SVG height
const LINEAR_MAIN_Y = 250;   // y of the main track
const LINEAR_BR_LEN = 150;   // branch stub length (upward from main track)
const LINEAR_TICK   = 76;    // tick length below station dot
const LINEAR_DOT_R  = 16;    // station dot radius

/* ── ForkMap (branching track, e.g. O line) */
const FORK_SVG_H    = 640;   // total SVG height
const FORK_TRUNK_Y  = 300;   // y of the trunk (shared) segment
const FORK_UPPER_Y  = 170;   // y of the upper arm
const FORK_LOWER_Y  = 430;   // y of the lower arm
const FORK_TICK     = 60;    // tick length between dot and label
const FORK_DOT_R    = 16;    // station dot radius
