# 台北捷運人流分析 — Design Handoff

> Exported from claude.ai/design · Project: 台北捷運人流分析圖 · 2026-05-16

---

## Project Goal

An interactive single-page web app visualizing Taipei MRT passenger entry/exit data.

**Phase 1 scope (implemented):** Red line (淡水信義線) + March 2026 data only.  
**Final target:** All five lines + data from 2025 onward.

---

## Layout

```
┌─────────────────────────── Top Bar ──────────────────────────────┐
│  Title  │  Date & Weekday filters  │  Time slot filters  │ Legend │
├──────────────────────────────────┬───────────────────────────────┤
│                                  │   Summary KPIs (進/出/合計)   │
│   Map Panel (left, 1fr)          ├───────────────────────────────┤
│   · Tab 01: Linear horizontal    │   Bar chart — station ranking  │
│   · Tab 02: Network schematic    ├───────────────────────────────┤
│                                  │   Pie chart — top-6 share      │
└──────────────────────────────────┴───────────────────────────────┘
```

- **Body grid:** `1fr 380px` — map takes remaining width, side panel is fixed 380 px
- **Top bar grid:** `minmax(240px, auto) 1fr auto`
- App is full-viewport (`100vh`), no scrolling at shell level

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (CDN UMD, no build step) |
| Transpiler | Babel Standalone (browser) |
| Fonts | IBM Plex Sans, IBM Plex Mono, Noto Sans TC (Google Fonts) |
| Charts | Hand-rolled SVG (no chart library) |
| Data | `data/mrt_data_202603.json` (local fetch) |

**File structure:**
```
index.html          — shell; loads React, Babel, then the three scripts below
redline.js          — line geometry, station coordinates, color constants (plain JS)
linearmap.jsx       — LinearMap component (horizontal route diagram)
app.jsx             — everything else: App, TopBar, MapPanel, SidePanel, charts
styles.css          — design tokens + all component styles
data/
  mrt_data_202603.json
```

---

## Design Tokens

### Colors

**MRT line colors:**
| Token | Hex | Line |
|---|---|---|
| `--line-br` | `#B57A24` | 文湖線 (Wenhu) |
| `--line-r` | `#E3002C` | 淡水信義線 (Tamsui–Xinyi) |
| `--line-g` | `#008659` | 松山新店線 (Songshan–Xindian) |
| `--line-o` | `#F8B61C` | 中和新蘆線 (Zhonghe–Xinlu) |
| `--line-bl` | `#0070BD` | 板南線 (Bannan) |
| `--line-y` | `#E5C100` | 環狀線 (Yellow) |
| `--line-r-tint` | `#FBD9DF` | Red line light tint |

**Ink scale (neutral grays):**
```
--ink-0:   #FFFFFF   --ink-50:  #F6F7F9   --ink-100: #ECEEF2
--ink-200: #DDE1E8   --ink-300: #C2C8D2   --ink-400: #9098A6
--ink-500: #6B7280   --ink-600: #4B5260   --ink-700: #2F3540
--ink-800: #1B1F27   --ink-900: #0E1117
```

**Brand blues:**
```
--brand-50:  #EEF1FA   --brand-100: #D7DEF1   --brand-200: #AFBCE3
--brand-300: #7E91CF   --brand-400: #4E66B7   --brand-500: #2A4395
--brand-600: #1F3477   --brand-700: #17285C   --brand-800: #11254A
--brand-900: #0A1733
```

**Heat scale (choropleth / data):**
```
--heat-0: #EAF2FB   --heat-1: #BFD8EE   --heat-2: #88BCDC   --heat-3: #6BAACE
--heat-4: #F1C45B   --heat-5: #ED8B3A   --heat-6: #D9482A   --heat-7: #8E1D17
```

**Semantic tokens (light mode → dark mode):**
| Token | Light | Dark |
|---|---|---|
| `--fg-1` | `--ink-900` | `--ink-100` |
| `--fg-2` | `--ink-700` | `--ink-300` |
| `--fg-3` | `--ink-500` | `--ink-400` |
| `--bg-app` | `--ink-50` | `#0B0E14` |
| `--bg-surface` | `--ink-0` | `#151923` |
| `--bg-sunken` | `--ink-100` | `#1B2030` |
| `--bg-hover` | `--ink-100` | `#222838` |
| `--border-1` | `--ink-200` | `#262C3A` |
| `--border-2` | `--ink-300` | `#343B4D` |

Dark mode uses `@media (prefers-color-scheme: dark)` — follows the OS.

### Typography

```css
--font-sans: "IBM Plex Sans", "Noto Sans TC", -apple-system, sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
--font-tc:   "Noto Sans TC", "IBM Plex Sans", -apple-system, sans-serif;
```

Usage pattern:
- UI labels / body → `--font-sans`
- Numbers, codes, metadata → `--font-mono` with `font-variant-numeric: tabular-nums`
- Chinese station names → `--font-tc`

### Spacing & Radius

```
--radius-1: 2px    --radius-2: 4px    --radius-3: 8px
--radius-4: 12px   --radius-pill: 999px
```

### Shadows

```
--shadow-1: 0 1px 0 rgba(14,17,23,.04), 0 1px 2px rgba(14,17,23,.06)   /* cards */
--shadow-2: 0 2px 4px rgba(14,17,23,.06), 0 4px 12px rgba(14,17,23,.08)
--shadow-3: 0 8px 24px rgba(14,17,23,.12)                               /* tooltips, modals */
```

---

## Components

### Top Bar

Three-column grid (title | filters | legend).

**Date filter:**
- Segmented control: `依星期` / `依日期`
- Weekday mode: dropdown (全部, 平日, 週末, individual days 週一–週日)
- Date mode: dropdown listing each date in `meta.dates` with weekday label

**Time slot filter:**
- Segmented control: `大時段` / `小時`
- Preset mode: 早上尖峰 (07–09), 中午時段 (11–13), 晚間尖峰 (17–19), 全日 (00–23)
- Hour mode: 24-entry dropdown (00:00–23:00)

**Line legend chips:** Five pills (BR / R / G / O / BL). Currently only R is enabled; others render at 25% opacity with `disabled`.

---

### Map Panel — Tab 01: Linear Map (線型圖)

A horizontally scrollable SVG showing the red line as a single straight track.

**Layout constants:**
```js
STATION_GAP = 78     // px between adjacent station centers
PAD_X       = 96     // horizontal padding
SVG_HEIGHT  = 420
MAIN_LINE_Y = 200    // y-position of the main track
BRANCH_LEN  = 110    // stub length for 新北投 branch
```

**Interaction:**
- Horizontal scroll (mouse wheel triggers horizontal scroll, not zoom)
- Click a station dot → detail card slides up from bottom
- Click same station or × → dismiss card
- Initial scroll centers on 台北車站 (R10)
- When a station is selected, view scrolls to center it

**Station dot appearance:**
- Regular: `r=7.5`, 3px stroke, white fill
- Interchange: `r=9`, filled inner circle in line color
- Selected: halo ring + thicker stroke (4px) + label turns red

**Labels:** alternate above/below by index parity (even → above, odd → below). Each station shows Chinese name + English romanization.

**Branch (新北投):** vertical stub from 北投 going down (opposite side of its label), single station at end.

**Station detail card:**
- Centered, fixed to bottom of panel, max-width 520px
- Animated slide-up (`card-rise` keyframe)
- Shows: station code badge (line color bg), TC name, EN name, line name, transfer chips (if applicable), KPI grid (進站/出站/合計), progress bar (in vs out ratio), date/time context

---

### Map Panel — Tab 02: Network Map (路網圖)

Pan/zoom schematic map on a 1000×1050 canvas.

**Controls:** +/− buttons + reset (⤾), positioned top-right.

**Pan:** mouse drag. **Zoom:** scroll wheel (0.45×–3.5× range, zooms around cursor). Initial fit: tight around line bbox.

**Red line geometry** (strictly 0°/45°/90° only, rounded-arc corners):

```
淡水 (R28) ─── 45° SE diagonal ─── 芝山 (R17)
                                       │ 90° vertical
                                    台北車站 (R10)
                                       │ 0° horizontal (east)
                               大安 (R05) ─── 45° SE ─── 象山 (R02)

Branch: 北投 ─── 45° NE ─── 新北投 (perpendicular to main diagonal)
```

**Anchor coordinates (1000×1050 canvas):**
```
淡水:     { x: 95,  y: 100 }
芝山:     { x: 480, y: 485 }   ← corner 1: 45° → vertical
台北車站: { x: 480, y: 835 }   ← corner 2: vertical → horizontal
大安:     { x: 730, y: 835 }   ← corner 3: horizontal → 45°
象山:     { x: 835, y: 940 }
```

**Corner radius:** 22px (14px for branch). Uses quadratic bézier arcs.

**Line interactions:**
- Hover → line highlights (stroke-width 10→13, drop-shadow), others dim to 18% opacity + grayscale
- Click → locks selection (click again to deselect)
- Hover station → tooltip (fixed position, follows cursor)

**Station dot appearance:**
- Regular: `r=6`, white fill, line-color stroke
- Interchange: `r=8`, thicker stroke
- Flow glow: faint circle behind dot, opacity scales with total flow
- Dot radius grows slightly with log(flow): `r + min(4, log10(1 + total/200))`

**Tooltip:** fixed position (clamped to viewport), shows station code, name, line, 進站/出站/合計, current time slot.

---

### Side Panel — Summary KPI

Three equal-width cards in a row: 進站 (green) / 出站 (red) / 合計 (neutral).

Numbers formatted with `formatBig()`: values ≥ 100,000 show as `X.X萬`.

---

### Side Panel — Bar Chart (各站排行)

Stacked horizontal bars, one row per station sorted by total descending.

Row grid: `18px 84px 1fr 56px` (rank | name | bar | value).

Bar: two absolute-position spans, in-bar at 78% opacity, out-bar at 32% opacity, both `--line-r`.

---

### Side Panel — Pie Chart (主要車站佔比)

Donut chart: top-6 stations + 其他.

- SVG viewBox `0 0 120 120`, outer radius 52, inner radius 30
- Colors: `['#E3002C','#EB3E61','#F37088','#F9A2B0','#B61E3E','#85162F','#C2C8D2']`
- Center label: "TOTAL" + total count (IBM Plex Mono)
- Legend to the right: swatch + name + percentage

---

## Data Schema

**File:** `data/mrt_data_202603.json`

```
{
  "meta": {
    "dates": ["2026-03-01", "2026-03-02", ..., "2026-03-31"]
  },
  "daily": {
    "2026-03-01": {
      "松山機場": {
        "00:00": { "in": 14, "out": 6 },
        "01:00": { ... },
        ...
        "23:00": { ... }
      },
      ...  // 122 stations total
    },
    ...
  },
  "weekday_avg": { ... }
}
```

**Key facts:**
- 122 stations total in the dataset (all lines, not just red)
- Hours present are only non-zero hours (sparse — not all 24 hours exist per station/day)
- Aggregation: sum `in` + `out` across selected dates × selected hours

**Aggregation logic (app.jsx `aggregate()`):**
1. Filter to selected dates + hours
2. For each station in the active line, sum `in` and `out` across the cross-product
3. Returns `{ byStation: Map<name,{in,out}>, totalIn, totalOut }`

---

## Station List — Red Line (R)

| Code | TC Name | EN Name | Transfers |
|---|---|---|---|
| R28 | 淡水 | Tamsui | |
| R27 | 紅樹林 | Hongshulin | |
| R26 | 竹圍 | Zhuwei | |
| R25 | 關渡 | Guandu | |
| R24 | 忠義 | Zhongyi | |
| R23 | 復興崗 | Fuxinggang | |
| R22 | 北投 | Beitou | R-3 (新北投支線) |
| R22A | 新北投 | Xinbeitou | branch |
| R21 | 奇岩 | Qiyan | |
| R20 | 唭哩岸 | Qili'an | |
| R19 | 石牌 | Shipai | |
| R18 | 明德 | Mingde | |
| R17 | 芝山 | Zhishan | |
| R16 | 士林 | Shilin | |
| R15 | 劍潭 | Jiantan | |
| R14 | 圓山 | Yuanshan | |
| R13 | 民權西路 | Minquan W. Rd. | O (中和新蘆) |
| R12 | 雙連 | Shuanglian | |
| R11 | 中山 | Zhongshan | G (松山新店) |
| R10 | 台北車站 | Taipei Main Station | BL (板南) |
| R09 | 台大醫院 | NTU Hospital | |
| R08 | 中正紀念堂 | C.K.S. Memorial Hall | G (松山新店) |
| R07 | 東門 | Dongmen | O (中和新蘆) |
| R06 | 大安森林公園 | Daan Park | |
| R05 | 大安 | Daan | BR (文湖) |
| R04 | 信義安和 | Xinyi Anhe | |
| R03 | 台北101/世貿 | Taipei 101 / World Trade Center | |
| R02 | 象山 | Xiangshan | |

---

## Roadmap (from design chat)

**Completed:**
- Red line linear map + network schematic
- Pan/zoom network map with hover/click interactions
- Station tooltips (network) + detail card (linear)
- Top bar filters: date/weekday + time preset/hour
- Side panel: KPI summary, station bar chart, pie chart
- Light/dark mode (follows OS preference)
- Horizontal scroll on linear map

**Next steps (user intent):**
1. Add remaining four lines (G / O / BL / BR) — add coordinate data to a `lines.js` file alongside `redline.js`, push into `LINES` array; panel/filter logic needs no changes
2. Multi-month support — add JSON files under `data/`, wire a year/month dropdown in the top bar to swap the fetch target
3. Full-network schematic — user wants all stations on one coordinate system with strict 0°/45°/90° geometry (reference: https://tw.piliapp.com/mrt-taiwan/taipei/)
4. Right-panel trend line — full-day hourly trend chart for the selected line (slot not yet filled in the UI)
