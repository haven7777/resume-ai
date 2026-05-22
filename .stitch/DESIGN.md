# ResumeAI — Design System & Screens

## Stitch Project
- **Project ID:** `630464232669572998`
- **Project Name:** Resume AI Analyzer
- **Design System ID:** `assets/17563472813881971871`
- **Design System Name:** Resume AI – Modern Gradient

---

## Design Tokens

### Colors
| Role | Value | Usage |
|------|-------|-------|
| Primary | `#7C3AED` | Gradient start, icons, focus rings |
| Secondary | `#3B82F6` | Gradient end, secondary accents |
| Tertiary | `#06B6D4` | Data highlights |
| Background | `#F5F3FF` | Page background (lavender tint) |
| Surface | `rgba(255,255,255,0.75)` | Glassmorphism cards + blur(16px) |
| Text Primary | `#1E1B4B` | Headlines, body |
| Text Muted | `#6B7280` | Subtexts, labels |
| Border | `rgba(124,58,237,0.12)` | Card borders |
| Success | `#10B981` | Matched keywords, completed states |
| Warning | `#F59E0B` | Partial scores, in-progress |
| Error | `#EF4444` | Missing keywords, low scores |

### Typography
| Scale | Font | Size | Weight |
|-------|------|------|--------|
| Headline XL | Plus Jakarta Sans | 40px | 800 |
| Headline LG | Plus Jakarta Sans | 32px | 700 |
| Body MD | DM Sans | 16px | 400 |
| Code/Score | Space Grotesk | 14px | 500 |

### Shape & Elevation
- **Border Radius:** 12px (ROUND_TWELVE)
- **Glassmorphism:** `bg-white/70 backdrop-blur-lg border border-purple-100/20`
- **Button (Primary):** `bg-gradient-to-r from-[#7C3AED] to-[#3B82F6]` rounded-full with glow shadow
- **Color Mode:** Light
- **Color Variant:** VIBRANT

---

## Screens

### 1. Landing Page (Marketing)
- **Screen ID:** `8172f37f4bd84cce8445e52eae8eb441`
- **Title:** ResumeAI Landing Page
- **Sections:** Glassmorphism nav, hero with score card mockup, social proof bar, 6-feature grid, 3-step timeline, gradient CTA banner, dark footer

### 2. Upload Dashboard (Core Tool)
- **Screen ID:** `2c54042b61fa48e8a4dd028a8f0a822c`
- **Title:** ResumeAI Upload Dashboard
- **Sections:** Nav, page header, two-column upload form (PDF dropzone + job description textarea), analyze CTA, process timeline, recent analyses list

### 3. Loading / Progress Screen
- **Screen ID:** `95d5d53ff3a540a5b9297fd5fc98fe33` (base)
- **Screen ID:** `67f8bf2689cd4673b53ef46bb204b35f` (premium animated)
- **Title:** Multi-Agent Analysis Progress / Premium Animated Loading Screen
- **Sections:** Centered glassmorphism card, pulsing AI orb, 3 agent rows (HR ✓, Tech Lead ⏳, Market Queued), overall progress bar, tip card, cancel link

### 4. Analysis Results Dashboard
- **Screen ID:** `40f73af8b4f94a38b88bda1922b474eb`
- **Title:** ResumeAI Analysis Results Dashboard
- **Sections:** Nav with download CTA, breadcrumb header, 3 score ring cards (87/100 overall, 72/100 ATS, 91/100 tech), agent reports accordion (HR expanded), strengths/improvements grid, right-column quick stats + skills heatmap + action CTA, sticky footer bar

---

## Viewing Designs
Open Stitch and navigate to project `630464232669572998` to view, edit, or export HTML for any screen.
