# docs/data

Reference data that is not served by the app.

## sai_mu_master_10yr_2026_2036.csv

Owner-supplied catalogue of 239 dated มู and festival events, 2026 to 2036 (Buddhist, Chinese deity days, Hindu, Christian, local shrines). Columns: `Date, Event_Name, Faith, Deity_Group, Action_Type, Daily_Do, Daily_Avoid, Conflict_Zodiac, Lucky_Color`. Received 2026-10-24.

**Status: candidate pool, not a date authority.** Audit on 2026-10-24:

- It is good content: what people do at each event, what to avoid, lucky colours, and local shrine days our verified list does not have.
- Dates: of 13 festivals shared with `horo-be/lib/shared/data/thai-events.ts`, 8 agree and 5 differ (for example อาสาฬหบูชา 2027: csv 17 Jul, Bank of Thailand notice 18 Jul; ออกพรรษา 2027: csv 30 Sep, lunar rule about 15 Oct). Do not show a date from this file to readers until a named source confirms it.
- `Conflict_Zodiac` is not computed from the calendar. It matches the real day-branch clash (六冲) in only 15 of 239 rows and almost never names ปีกุน or ปีจอ. Ignore it; compute the clash from the day pillar against the reader's year animal (see `horo-be/src/systems/fortune/monthly-insights.ts`).
- Some years repeat the same lunar-dated event on the wrong day; later years (2029 onward) were not checked at all.

How it is used: seed pool for ticket T22 in `docs/monetization-tickets.md` (a monthly research job proposes rows, a person approves them, readers only see approved rows). Rows whose date equals a verified row feed the do/avoid/lucky-colour notes in `horo-be/lib/shared/data/mu-event-notes.ts`.

The verified list (every row with a source URL) is `horo-be/lib/shared/data/thai-events.ts`; extend it before 2028.
