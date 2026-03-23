# fariq-app

System to gather insights about your teams using PM tools like Azure DevOps etc.

## What?

1. Azure DevOps KPIs (tickets closed, PRs, commits — per person/month)
2. Holiday & leave tracker (approved days off, public holidays by country)
3. Sickness tracker (sick days logged, patterns)
4. Daily work summary (what each person worked on, auto-pulled from DevOps)
5. Monthly timesheet generation (exportable PDF/Excel per team member)

## Why?

1. It solves a real, painful problem. Most dev teams juggle 3–4 separate tools for this: Azure DevOps for work, an HR system for leave, spreadsheets for timesheets, and email for sick day notifications. Nobody has connected them cleanly for software teams specifically.
2. The data is already there. Azure DevOps work items, commits, and PRs give you a natural "what did this person do today?" feed — which is the hardest part of a timesheet to fill manually. Automating that narrative is genuinely valuable.
3. Timesheets have a clear, recurring monetization moment. Every month, every team, every company needs them. That's a strong retention hook compared to a dashboard people check occasionally.

## Concerns?

1. HR compliance complexity
Leave and sickness tracking touches employment law — rules differ by country (Qatar, UK, EU all have different sick leave entitlements, carryover rules, documentation requirements). You'd need to either keep it simple/configurable or pick a target market.
2. Competition is stronger here
Tools like Personio, BambooHR, Factorial, and Jira + Tempo already do timesheet + leave tracking. Your differentiator is the Azure DevOps auto-fill angle — that's real, but you'd need to lead with it.
3. Two different buyers
KPI dashboards are bought by engineering managers. HR/leave tracking is bought by HR or operations. You might find yourself selling to two people who don't talk to each other. That complicates sales.
4. Privacy & trust sensitivity
Combining "what did you commit today" with "how many sick days did you take" can feel surveillant to employees. Framing and permissions matter a lot.

## Summary

> "Automated monthly timesheets for Azure DevOps teams" — where the daily work log is auto-generated from DevOps activity, leave/sickness is layered on top, and a clean PDF goes to the manager (or client for billing) at month end.

## Tech

Using turborepo - a monorepo tool.

Key commands:

| Command | Description |
| --- | --- |
| `npm run dev` | Start all apps in parallel |
| `npm run build` | Build everything (shared first, then apps) |
| `npm run dev --workspace=apps/web` |Start web only (port 3000) |
| `npm run dev --workspace=apps/api` | Start API only (port 3001) |

**Notes:**

`@fariq/shared` is imported directly in both `apps/api` and `apps/web` via npm workspaces symlinking
The web dev server proxies `/api/*` to http://localhost:3001
API uses `node --watch` with native TypeScript stripping (no build step needed in dev)
Turborepo ensures `shared` builds before `api` and `web` during `npm run build`.
