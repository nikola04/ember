# Handoff: Ember — Main App Shell

## Overview

Ember is a self-hosted, open-source Discord alternative for small private groups, built production-ready. This handoff covers the **main app shell**: the primary three-column chat interface (server rail, channel sidebar, message area) plus an optional toggleable member list.

The positioning is **"Discord but _yours_"** — privacy, data ownership, no artificial limits, focused over feature-bloated. Every design choice should reinforce ownership and focus, not chase Discord feature-parity.

## About the Design Files

The file in this bundle (`Ember App.dc.html`) is a **design reference created in HTML** — a prototype showing the intended look and behavior. It is **not production code to copy directly**.

> ⚠️ Note: `Ember App.dc.html` is a "Design Component" — it uses a custom `<x-dc>` runtime (`support.js`), inline-styled markup, `{{ }}` template holes, and `<sc-if>` blocks. **Do not try to run or import this file in the real app.** Read it as a visual + behavioral spec and **recreate the UI in the target codebase** using its established patterns.

The intended stack (from the Ember project spec) is:

- **Frontend:** React + Vite + Tailwind. State: TanStack Query (server state), Zustand (realtime/WS state), TanStack Virtual (message list). NO Redux.
- **Backend:** Bun + Elysia (TS), modular monolith. Postgres + Drizzle. WebSocket + Redis pub/sub. Voice via LiveKit (SFU).

Recreate these designs in that environment (or, if starting fresh, in the most appropriate equivalent), using its component and styling conventions.

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, radii, and interaction states are all specified below and should be reproduced precisely. Avatar colors, exact hex values, and pixel measurements are intentional. Recreate pixel-faithfully, then wire to real data.

---

## Visual Direction — Cinematic Dark

The aesthetic is **cinematic dark**, NOT Discord's flat blue-grey "tech utility" look. Think "intentionally lit film frame" — deep layered darkness with one warm accent that glows out of it. Built through **restraint, not addition**: deep layered darkness, one warm accent used sparingly, two-weight typography with hierarchy through color, generous whitespace. When in doubt about adding color/weight/element — the answer is usually no.

Key techniques used in the mock:

- **Layered backgrounds** (not one flat surface) to create depth — the rail is darkest, panels lift slightly.
- A **vignette**: full-screen `box-shadow: inset 0 0 180px 40px rgba(0,0,0,.45)` overlay (pointer-events:none) darkens the edges like a lit frame.
- A faint **coral radial glow** bleeding from the top-left of the message area: `radial-gradient(circle at 22% -8%, rgba(227,93,58,.05), transparent 42%)`.
- Coral accent appears **only** on: active channel indicator, logo, file icons, key hover CTAs. Mint **only** for live/voice states.

---

## Layout

A full-viewport (`100vw × 100vh`, `overflow:hidden`) horizontal flex container. Four columns, left → right:

| Column                 | Width            | Notes                                              |
| ---------------------- | ---------------- | -------------------------------------------------- |
| **1. Server rail**     | `68px` (fixed)   | Vertical server icon list + add-server + explore   |
| **2. Channel sidebar** | `244px` (fixed)  | Server header, channel groups, user panel          |
| **3. Main area**       | `flex:1` (fills) | Channel header, message list, input bar            |
| **4. Member list**     | `236px` (fixed)  | **Toggleable** — mounts/unmounts via header button |

Root container: `display:flex; background:#0c0c0f; color:#d8d8de; font-family:'Hanken Grotesk'; font-size:15px; -webkit-font-smoothing:antialiased;`

---

## Screens / Views

### Column 1 — Server Rail

- **Purpose:** Switch between servers the user belongs to; add a new server.
- **Layout:** `width:68px; background:#070708; border-right:1px solid #131318; flex column; align-items:center; padding:14px 0; gap:9px;`
- **Components:**
    - **Ember logo tile** (top): `46×46px; border-radius:14px; background:linear-gradient(155deg,#161013,#0e0a0b); border:1px solid #2c1c1a; box-shadow:0 0 24px -7px rgba(227,93,58,.5);` Contains the flame logo SVG (coral `#e35d3a` flame with a light `#fbd0bb` inner core), `width:25px`, gently pulsing opacity (see `ember-glow`). **The logo is a plain flame only — no trees/other elements.**
    - **Divider:** `26×1px; background:#1c1c22; margin:3px 0`.
    - **Active server** (TH): wrapper `position:relative`. Accent pill on the left: `position:absolute; left:-14px; top:50%; translateY(-50%); width:4px; height:30px; background:#e35d3a; border-radius:0 4px 4px 0`. Tile: `46×46px; radius:14px; background:#3a2a26; border:1px solid #4a342f; color:#efe2dc; font-weight:500; font-size:15px`.
    - **Inactive servers** (WK, DEV, MU, BK): `46×46px; radius:14px; font-weight:500`. Each has a slightly different muted/desaturated background tint (e.g. `#222730`, `#252a26`, `#2b2630`, `#2d2a24`). **Hover:** `border-radius:16px` + background lightens (transition `.18s`). (Active server uses the full accent pill; an inactive server with unread would use a short `8px` white pill — not shown in mock but implied by Discord-style pattern.)
    - **Add server** button: `46×46px; radius:14px; border:1px dashed #2a2a32`; `add` icon in mint `#8fd9bf`. **Hover:** `border-color:#3a564c; background:#101714`.
    - **Explore** button (pushed to bottom with `margin-top:auto`): `explore` icon, color `#4a4a52` → hover `#8a8a94`.

### Column 2 — Channel Sidebar

- **Purpose:** Show current server's channels, grouped into collapsible categories; per-user controls at the bottom.
- **Layout:** `width:244px; background:#0a0a0c; border-right:1px solid #16161b; flex column`.
- **Server header:** `height:56px; flex row; justify-between; padding:0 18px; border-bottom:1px solid #16161b`. Server name "The Hideout" `font-weight:500; font-size:15.5px; color:#f0f0f4`. `expand_more` chevron `#6a6a74`. **Hover:** `background:#0c0c0f` (whole bar; it's a dropdown trigger for server settings/invite/etc.).
- **Channel scroll area:** `flex:1; overflow-y:auto; padding:16px 10px 10px`.
- **Group header** (e.g. "General", "Voice"): `flex row; gap:4px; padding:4px 8px; cursor:pointer; color:#6a6a74` (hover `#9a9aa2`). A chevron (`expand_more`, `16px`) that **rotates** `0deg` (open) ↔ `-90deg` (collapsed), transition `.18s`, and a label `font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:.1em`. Clicking toggles the group open/closed. Voice group has `margin-top:14px`.
- **Text channel row:** `flex row; gap:9px; padding:7px 10px; border-radius:7px`. `tag` (#) glyph `18px` + name `font-size:14.5px`.
    - **Active** channel: `background:#15151a`, with a left accent border `position:absolute; left:0; width:3px; height:18px; background:#e35d3a; border-radius:0 3px 3px 0`; glyph + name both turn coral/white (`#e35d3a` glyph, `#f0f0f4` name, `font-weight:500`).
    - **Inactive:** color `#6a6a74`. **Hover:** `background:#101015; color:#c8c8d0`.
    - Channels in mock: `general` (active), `random`, `links`, `photos`.
- **Voice channel row:** like text but with `graphic_eq` glyph in mint `#8fd9bf`. Channels: `Lounge`, `Gaming`.
    - **Connected members** appear indented underneath a voice channel (`padding-left:24px; gap:5px`): a `24×24px; radius:8px` avatar + name. A **speaking** member's avatar has a mint border `1.5px solid #8fd9bf` and the `ember-speak` pulse animation; their name is mint `#8fd9bf`. A **muted** member's avatar is `opacity:.6`, name muted `#7a7a84`, with a `mic_off` glyph pushed right (`margin-left:auto`).
- **User panel** (bottom, `flex:none; height:60px`): `background:#0e0e12; border-top:1px solid #16161b; padding:0 12px; flex row; gap:10px`.
    - Avatar `34×34px; radius:10px` with a presence dot bottom-right: `11×11px; border-radius:50%; background:#5fa87a (online); border:2.5px solid #0e0e12`.
    - Name `jordan` `13.5px; font-weight:500; color:#e8e8ee`; status `online` `11.5px; color:#6a6a74`.
    - Three `30×30px; radius:8px` icon buttons: `mic`, `headphones`, `settings` (color `#8a8a94`; hover `background:#16161b; color:#d8d8de`).

### Column 3 — Main Area

- **Purpose:** Read/scroll the active channel and send messages.
- **Layout:** `flex:1; min-width:0; flex column; background:#0c0c0f; position:relative`. Contains the coral radial-glow overlay (z-index:0).
- **Channel header:** `height:56px; flex row; gap:14px; padding:0 18px; border-bottom:1px solid #16161b; background:rgba(12,12,15,.7); backdrop-filter:blur(8px); z-index:2`.
    - `tag` glyph `20px #5a5a64` + channel name `general` (`16px; font-weight:500; color:#f0f0f4`).
    - Vertical divider `1×18px; background:#20202a`.
    - Topic text `13.5px; color:#6a6a74` with ellipsis truncation (`max-width:280px`): "everything and nothing — the main channel".
    - **Right actions** (`margin-left:auto; gap:4px`): a fake search field (`background:#101015; border:1px solid #1c1c22; radius:9px; padding:6px 12px; width:170px`; `search` glyph + "Search" placeholder `#4a4a52`), then `34×34px; radius:9px` icon buttons for `notifications`, `push_pin`, and `group` (members toggle).
    - The **members toggle** button reflects state: when open, `color:#e35d3a; background:rgba(227,93,58,.12)`; when closed, `color:#8a8a94; background:transparent`.
- **Message list:** `flex:1; overflow-y:auto; padding:8px 4px 4px; z-index:1`. **Must be virtualized in production (TanStack Virtual).**
    - **Day divider:** centered row — two `flex:1; height:1px; background:#16161b` rules around an uppercase label ("Today", `11px; font-weight:500; color:#6a6a74; letter-spacing:.1em`).
    - **Message group:** `flex row; gap:14px; padding:10px 24px`. **Hover:** `background:#0e0e12` (whole row).
        - Avatar: `42×42px; flex:none; border-radius:14px`, muted/desaturated per-user color, initial letter centered (`16px; font-weight:500`).
        - Header line: name (`15px; font-weight:500`, colored per user — see Author Colors) + timestamp (`11px; color:#4a4a52`).
        - Body lines: `line-height:1.55; color:#d8d8de`. Consecutive lines from the same author stack with `margin-top:2px` (no repeated avatar/header).
    - **Reaction pills:** `flex; gap:6px; margin-top:7px`. Each pill: `flex; gap:6px; background:#15151a; border:1px solid #20202a; border-radius:11px; padding:3px 9px; font-size:12.5px`. Emoji + count (`color:#8a8a94`). Keep subtle — not inflated.
    - **File attachment card:** `flex row; gap:13px; margin-top:9px; background:#101015; border:1px solid #1c1c22; border-radius:12px; padding:13px 15px; width:340px`. Icon tile `40×40px; radius:10px; background:rgba(227,93,58,.12)` with a **coral** `description` glyph. Filename `14px; font-weight:500; color:#e8e8ee` (ellipsis), meta "240 KB · PDF" `12px; color:#6a6a74`, `download` glyph pushed right. **Hover:** `border-color:#2a2a32`.
    - **Image embed (placeholder):** `width:320px; height:172px; border-radius:12px; border:1px solid #1c1c22`, with a diagonal hatch placeholder background. In production this is the actual image thumbnail (lazy-loaded, click to expand).
    - **Typing indicator:** `flex row; gap:10px; padding:6px 24px 16px`. Three `5×5px` dots (`background:#8a8a94`) animating with `ember-typing` (staggered `.2s`, `.4s` delays), followed by "<name> is typing…" `12.5px; color:#6a6a74` (name colored per author).
- **Message input bar:** `flex:none; margin:0 18px 20px; flex row; gap:12px; background:#101015; border:1px solid #20202a; border-radius:14px; padding:11px 14px`. **Elevated card with its own border — NOT sunk into the background.**
    - Left `30×30px; radius:9px; background:#16161b` add/attach button (`add` glyph `#8a8a94`; hover `color:#e35d3a; background:#1c1418`).
    - Placeholder "Message #general" `14.5px; color:#4a4a52` (becomes a real text input).
    - Right: `sentiment_satisfied` (emoji) and `send` icon buttons (`30×30px`; `#8a8a94` → hover `#d8d8de`).

### Column 4 — Member List (toggleable)

- **Purpose:** Show who's in the server, grouped by online status (and in production, by role).
- **Visibility:** Mounted only when `memberOpen` is true (toggled by the header `group` button). In the mock it defaults open.
- **Layout:** `width:236px; flex:none; background:#0a0a0c; border-left:1px solid #16161b; flex column`.
- **Header:** `height:56px; padding:0 18px; border-bottom:1px solid #16161b`. Label "Members — 6" (uppercase `11px; color:#6a6a74; letter-spacing:.1em`).
- **Group label:** "Online — 4" / "Offline — 2", same uppercase muted style, `padding:0 8px 8px` (offline group has `padding-top:18px`).
- **Member row:** `flex row; gap:11px; padding:7px 8px; border-radius:8px`. **Hover:** `background:#101015`.
    - Avatar `32×32px; radius:10px` (muted per-user color) with presence dot bottom-right `11×11px; border:2.5px solid #0a0a0c` — mint `#8fd9bf` if in voice, green `#5fa87a` if online.
    - Name (`13.5px; font-weight:500`, author color) + optional status sub-line (`11px; line-height:1.3`): e.g. "In voice · Lounge" / "In voice · muted" in **mint** `#8fd9bf`, or "playing Hollow Knight" / "online" in `#6a6a74`.
    - **Offline members:** entire group at `opacity:.45` (hover row → `.8`); names `#9a9aa2`, neutral grey avatars, no presence dot.

---

## Interactions & Behavior

- **Collapse channel group:** Clicking a group header (General / Voice) toggles its channel list. Chevron rotates `0deg ↔ -90deg` (`.18s`). State: `textOpen`, `voiceOpen` booleans.
- **Toggle member list:** Clicking the `group` icon in the channel header mounts/unmounts column 4. The icon itself reflects state (coral + tinted bg when open). State: `memberOpen` boolean.
- **Hover states** (all `.12s–.18s` transitions):
    - Server icons: square→squircle (`border-radius:14px→16px`) + bg lighten.
    - Channel rows: bg `#101015`, text brightens to `#c8c8d0`.
    - Message rows: full-row bg `#0e0e12`.
    - Icon buttons: bg `#16161b`, icon → `#d8d8de` (attach button → coral).
    - File card: border brightens.
- **Animations:**
    - `ember-glow` — logo opacity `.85↔1`, `3.4s ease-in-out infinite`.
    - `ember-speak` — speaking-avatar mint ring pulse: `box-shadow 0 0 0 0 → 0 0 0 4px rgba(143,217,191,.5→0)`, `2.2s ease-out infinite`.
    - `ember-typing` — typing dots translateY `-3px` + opacity, `1.3s infinite`, staggered `0 / .2s / .4s`.
- **Real-time presence is core** — design for live updates of: who's online, who's in each voice channel (with speaking/muted state), and who's typing. These should be driven by WebSocket events in production.

## State Management

Local UI state in the mock (Zustand or component state in production):

- `textOpen: boolean` (default `true`) — General group expanded.
- `voiceOpen: boolean` (default `true`) — Voice group expanded.
- `memberOpen: boolean` (default `true`) — member list visible.

Production server/realtime state (per Ember spec):

- **TanStack Query:** servers list, channel list per server, message pages (paginated/infinite), member list.
- **Zustand:** WebSocket connection state, realtime presence (online/voice/typing), voice room state (who's connected/speaking/muted via LiveKit).
- **TanStack Virtual:** the message list (virtualized scrollback).

## Design Tokens

### Colors

```
/* Backgrounds — 4 depth levels (layered, never pure #000) */
--bg-rail:      #070708   /* server rail (darkest) */
--bg-panel:     #0a0a0c   /* channel sidebar, member list */
--bg-main:      #0c0c0f   /* main area / root */
--bg-lift:      #101015   /* inputs, cards, hover surfaces */
--bg-user:      #0e0e12   /* user panel */
--bg-active:    #15151a   /* active channel row */
--bg-icon-btn:  #16161b   /* icon-button hover */

/* Borders — barely visible (~0.5–1px) */
--border-1:     #16161b
--border-2:     #1c1c22
--border-3:     #20202a
--border-rail:  #131318

/* Text */
--text-primary: #f0f0f4   /* names, titles */
--text-body:    #d8d8de   /* messages */
--text-muted:   #6a6a74   /* labels, topics, meta */
--text-hint:    #4a4a52   /* timestamps, placeholders */
--text-dim:     #8a8a94   /* idle icons */

/* Accent — coral (use RARELY: active indicator, logo, file icons, key CTAs) */
--accent:       #e35d3a
--accent-soft:  #fbd0bb   /* logo inner core */
--accent-tint:  rgba(227,93,58,.12)   /* tinted bg behind coral icons */

/* Voice / live state — soft mint (ONLY for live/voice) */
--mint:         #8fd9bf

/* Presence */
--online:       #5fa87a
--in-voice:     #8fd9bf

/* Avatar colors — muted / desaturated (identity without shouting) */
maya:   #6e4f44 (text #e35d3a)   theo:   #4f5e72 (text #8aa0bd)
jordan: #57664f (text #8fa888)   sam:    #6e5566 (text #b08aa6)
alex:   #3a3f3a                  robin:  #393c42
```

### Typography

- **Font:** `'Hanken Grotesk'` (Google Fonts), system-ui fallback. Monospace (`ui-monospace, 'SF Mono', Menlo`) only for technical placeholder labels.
- **Two weights only:** `400` (body/messages) and `500` (names/titles). **Never heavy bold.** Hierarchy comes from **color + size**, not weight.
- **Sizes:** base `15px`. Channel/topic name `16px`. Message body `15px / line-height 1.55`. Channel rows `14.5px`. Names in list `13.5px`. Timestamps & meta `11–12px`. Section labels `11px` uppercase, `letter-spacing:.1em`.
- **Icons:** `lucide-react` only. Use `size={16–22}` and `strokeWidth={1.5}` to match the original Material Symbols light-weight feel. Color via Tailwind `className`, not the `color` prop.

### Spacing / Radius / Shadow

```
Radius:  14px (cards, avatars, logo, server tiles, input bar)
         12px (file/image embeds)
         10px (small avatars, icon tiles)
         9px  (header icon buttons, search)
         8px  (member rows, tiny avatars)
         7px  (channel list rows)
         11px (reaction pills, presence dots = 50%)
Column widths: rail 68 / sidebar 244 / member list 236; headers 56px tall.
Padding: message rows 10px 24px; channel rows 7px 10px; sidebar scroll 16px 10px.
Shadows:  logo glow  0 0 24px -7px rgba(227,93,58,.5)
          vignette   inset 0 0 180px 40px rgba(0,0,0,.45)
          speak ring 0 0 0 4px rgba(143,217,191,.5→0)
```

## Assets

- **Fonts:** Hanken Grotesk (Google Fonts, linked in `<head>`). No icon font — icons come from `lucide-react`.
- **Logo:** inline SVG flame (coral body + light inner core), kept as a React component at `src/components/EmberLogo.tsx`. **Final logo is a flame only** (earlier tree variants were rejected). This is the only allowed non-lucide icon.
- **Avatars / message images:** placeholders in the mock (colored initials + hatched image box). Replace with real uploaded media.
- **Icons (lucide-react mapping from the original mock):**
    - text channel glyph → `Hash`
    - voice channel glyph → `Volume2`
    - mic / mic muted → `Mic` / `MicOff`
    - headphones / settings / search → `Headphones` / `Settings` / `Search`
    - notifications / pin / members toggle → `Bell` / `Pin` / `Users`
    - add server / attach / explore → `Plus` / `Plus` / `Compass`
    - file attachment / download → `FileText` / `Download`
    - emoji picker / send → `Smile` / `Send`
    - group expand chevron → `ChevronDown` (rotated `-90deg` when collapsed)

## Files

- `Ember App.dc.html` — the high-fidelity HTML design reference (this folder). Open in a browser to view; read the source for exact inline styles. Ignore the `<x-dc>` / `support.js` runtime scaffolding — it is not part of the design.
