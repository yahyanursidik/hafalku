# AGENTS.md — Hafalku

## Mission
Build Hafalku as a calm, child-first Quran memorization companion.

## Product Principle
Dengar → Ikuti → Lihat → Ulangi → Kurangi Bantuan → Ingat → Murajaah

## Architecture
Frontend:
- React
- TypeScript
- Refine Core 5 headless
- Custom UI

Backend:
- Vercel API
- Neon PostgreSQL
- Typed schema
- Versioned API

Quran:
- self-hosted canonical dataset
- versioned
- read-only at runtime
- no Quran.com runtime dependency

## Absolute Rules
1. Never modify canonical Arabic text for presentation.
2. Never create Latin-only mode.
3. Never generate Quran text/transliteration using AI in production.
4. Never expose mutable Quran verse endpoints.
5. Keep memorization metadata separate from Quran Core.
6. Do not add features outside active phase.
7. Do not create generic admin/SaaS child UI.
8. Mobile first.
9. Arabic is the visual hero.
10. Minimize child data collection.

## Coding Style
- Prefer explicit code over clever abstraction.
- Avoid premature generic frameworks.
- Keep domain boundaries clear.
- Validate at API boundaries.
- Use typed contracts.
- Keep functions small.
- Avoid dependencies when native/simple code is enough.

## UX Rules
- quiet;
- large Arabic;
- whitespace;
- minimal decoration;
- no Islamic cliché ornamentation;
- no mascot;
- no leaderboard;
- no aggressive streak.

## Before Coding
1. Read relevant `.md` files.
2. Inspect current repository.
3. State active phase.
4. Make a small plan.
5. Change only necessary files.

## After Coding
Run:
- lint
- typecheck
- tests
- production build

If a command fails:
- fix;
- rerun;
- do not claim completion while failing.

## Security
- secrets server-side only;
- ownership checks for child data;
- no sensitive logs;
- validate inputs;
- parameterized queries;
- least privilege.

## Quran Dataset
Any dataset change must:
1. create a new version;
2. validate;
3. diff;
4. be reviewed;
5. be explicitly activated.

Never overwrite active Quran data silently.


## Anti-Slop Mandatory Rules
Read `10-ANTI-SLOP-AI.md` for every child-facing UI task.

Before UI implementation:
1. resolve direction;
2. clarify asset need;
3. subtract before adding.

Before delivery:
1. run anti-slop review;
2. run Delivery Gate;
3. report intentional exceptions.

Never add:
- redundant eyebrow badge;
- meaningless decorative status dot;
- card proliferation;
- filler illustration;
- filler copy;
- excessive glass/gradient/glow;
- UI elements merely to fill whitespace.

If anti-slop conflicts with Quran integrity, Quran integrity wins.
If anti-slop conflicts with accessibility, accessibility wins.
