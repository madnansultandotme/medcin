# Medcin — Design Theme & Screen Specification

*Wellness theme, v1 — companion to the clickable prototype*

**Prototype:** https://claude.ai/artifact/97qdY7EHRygb6prmUVV68K

---

## 1. Theme

### 1.1 Concept
A clinical-chart identity carried into a warmer register for wellness: times, prices and durations are treated as data (monospace), not marketing copy. One token block drives every screen — rebrand by editing these values in one place.

### 1.2 Palette

| Token | Hex | Role |
|---|---|---|
| `ink` | `#1F2A22` | Primary text, nav, headings |
| `paper` | `#F1F0E7` | Page background (warm sand-white) |
| `surface` | `#FFFFFF` | Card / panel background |
| `mist` | `#DFDBCE` | Hairlines, borders, dividers |
| `clay` | `#B5713F` | Primary action — book, confirm, save |
| `sage` | `#5C8C63` | Available / confirmed / active state |
| `amber` | `#C98A34` | Pending / limited / caution state |
| `muted` | `#6B6B5E` | Secondary text |

Dark mode: `ink`→`#EDECE4`, `paper`→`#171A15`, `surface`→`#1F231C`, `mist`→`#333628`, `muted`→`#9A9A88` (same 4 accent tokens unchanged).

### 1.3 Typography
- **IBM Plex Sans** — headlines, body copy, UI labels, buttons
- **IBM Plex Mono** — anything that's a measurement: time, price, duration, status badges

### 1.4 Structural rules
- Square corners on cards/panels (`radius-panel: 0`), minimal radius on buttons/badges (`radius-action: 2px`) — ledger feel, not the rounded-card-kit default
- Status badges use color + mono text, never color alone: **Pending** (amber), **Confirmed/Active** (sage), **Flagged/Open** (clay), **Completed/muted** (mist)
- Doctor/provider cards carry a small avatar block, name, role, price — reused everywhere a provider appears

### 1.5 Principles
1. **Chart, not marketing** — data reads as data (mono), not prose
2. **One config** — every screen inherits the same 8 tokens
3. **Calm urgency** — clay for action, sage for available, amber for limited; no red alarm states

---

## 2. Screens needed

### Patient (4)
| Screen | Purpose |
|---|---|
| Search | Browse/filter centers & providers by service |
| Book | Provider profile, service list, date & time slot picker |
| Confirm | Booking summary + confirmation |
| My bookings | View upcoming/past appointments, cancel/reschedule |

### Med center (4)
| Screen | Purpose |
|---|---|
| Onboarding | Center profile — name, category, address, contact |
| Doctors & services | Add/edit doctors; add/edit procedure catalog |
| Availability | Per-doctor, per-day slot management (open/block) |
| Bookings inbox | Incoming appointments — accept/decline, status |

### Platform admin (4)
| Screen | Purpose |
|---|---|
| Centers | Approval queue for new centers + active directory |
| All bookings | Global view of bookings across every center |
| Disputes | Support/dispute tickets (no-shows, billing issues, refunds) |
| Settings | Commission rate, support contact, service categories |

**Total: 12 screens**, all built and clickable in the prototype above, grouped by role tab (Patient / Med center / Platform admin).

---

## 3. Status not yet covered (future screens)
- Payments/deposit flow
- Doctor-level calendar sync (Google/Outlook)
- Reviews & ratings
- Patient profile / saved payment details
- Center analytics dashboard (bookings over time, no-show rate)

These were explicitly out of MVP scope per the concept brief and aren't in the current prototype.
