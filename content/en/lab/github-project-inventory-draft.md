---
title: GitHub Project Inventory Draft
description: A review draft of repositories and organizations visible through the authenticated GitHub CLI account, grouped into project-page and lab-note candidates.
date: 2026-05-29
status: Draft
tags:
  - github
  - portfolio
  - inventory
  - content-planning
draft: true
---

This draft was created from the authenticated GitHub CLI account `mehotkhan` on 2026-05-29.

It includes repositories visible to the token, including private repositories. Before turning this into public project or lab content, private client work, internal tools, and unfinished experiments should be reviewed carefully.

## Account Snapshot

- GitHub user: [mehotkhan](https://github.com/mehotkhan)
- Display name: Mohetios
- Public profile site: <https://mohet.ir/>
- Public repositories reported by GitHub profile: 28
- Visible organizations: `itpiran`, `konar-studio`, `bagche`

GitHub does not expose organization creator information through the simple `gh api user/orgs` result. The organizations below are the organizations visible to this account, not confirmed as created by this account.

## Recommended Project Pages

These are strong candidates for `content/en/projects` because they have a clear product shape, useful technical story, or public artifact.

| Candidate | Source repo | Why it belongs in Projects | Suggested status |
| --- | --- | --- | --- |
| Safarnak | `mehotkhan/safarnak.app` | Full-stack travel product with mobile, edge backend, GraphQL, offline-first data, AI, and bilingual support. | Active |
| Nekonymous | `mehotkhan/Nekonymous` | Privacy-focused anonymous Telegram bot with Cloudflare Workers, Durable Objects, encryption, and abuse controls. | Prototype |
| Bandersnatch Interactive | `mehotkhan/BandersnatchInteractive` | Public, high-signal interactive media experiment with strong GitHub visibility. | Stable archive |
| Persian Word Cloud | `mehotkhan/persian-word-cloud` | Mature Persian NLP and visualization package with public adoption. | Stable archive |
| Totoro | `mehotkhan/totoro` | Jamstack blog starter with Nuxt, Decap CMS, Cloudflare Pages, and SSG concerns. | Archive |
| Mamoochi | `bagche/mamoochi` | Open-source Jamstack framework from the Bagche organization with Nuxt, Vue, and Cloudflare-friendly deployment assumptions. | Active archive |
| Persian LinkedIn | `mehotkhan/persian-linkedin` | Browser extension focused on Persian/RTL improvements for LinkedIn. | Stable archive |
| ZCalendar / Simple Taghvim | `mehotkhan/zcalendar`, `mehotkhan/simple-taghvim` | Calendar-related Vue projects that could be merged into one project page. | Archive |
| Bagche | `bagche/Front`, `bagche/mamoochi`, `bagche/Home` | Organization/product work around Bagche and Mamoochi. Needs private/public boundary review. | Review |

## Recommended Lab Notes

These are better as lab notes because they represent techniques, experiments, patterns, or engineering threads that can connect multiple projects.

| Lab note idea | Repos to draw from | Angle |
| --- | --- | --- |
| Personal Publishing Systems | `mohetios.dev`, `front`, `front_old`, `Inbox`, `totoro`, `totoro-beta` | Evolution from personal homepage to public workbench, static content, Nuxt, Cloudflare Pages, and CMS tradeoffs. |
| Persian Text and RTL Tooling | `persian-word-cloud`, `persian-linkedin`, `faPoems`, `faPoems-markdown`, `persian-twitter-day` | Persian script rendering, poems, word clouds, browser extensions, tokenization, and localized tooling. |
| Interactive Media in the Browser | `BandersnatchInteractive`, `sohaSimurgh`, `p2p-cinema` | HTML5 video, branching playback, local files, P2P cinema, and interactive narrative runtimes. |
| Edge Bots and Anonymous Messaging | `Nekonymous`, `aliZemani-Bot`, `goldenBot`, `imanoelling` | Telegram/bot routing, privacy, channel automation, abuse prevention, and edge deployment. |
| WebAssembly With Nuxt and TinyGo | `tinygo-wasm-tuts`, `nuxt-wasm` | Teaching path from TinyGo examples to Nuxt integration. |
| Nostr Experiments | `nostr-relay`, `cloudflare-nostr-relay`, forked `nostr` | Protocol experiments, relay implementation, Cloudflare deployment, and Erlang reference work. |
| Offline-First and P2P Product Architecture | `safarnak.app`, `p2p-bazzar`, `p2pBazzar*`, `pnews` | Local-first state, P2P networks, sync, edge backends, and product constraints. |
| IoT Product Stack | `irophome`, `irophome-backend`, `irophome-mobile`, `irophome-espbase`, `react-native-ble-manager` | ESP firmware, BLE/mobile integration, backend orchestration, and operational lessons. |
| Konar IoT Experiments | `konar-studio/ESP01-Signaling-Server`, `konar-studio/Arduino-sound-sonar`, `konar-studio/Front-Page` | Small C++/ESP/Arduino experiments from Konar Studio, useful as lab notes about device-to-web prototypes. |
| Small Infrastructure Tools | `cPanel-Cloudflare-Wildcard-SSL-Plugin`, `Netdata-Nginx`, `django-request-cache` | Practical infrastructure utilities with clear, narrow operational jobs. |

## Visible Organizations

| Organization | Description | Repositories visible |
| --- | --- | --- |
| `konar-studio` | An Opensource factory in all shapes | 4 |
| `bagche` | BagChe is an interesting platform that help you selling your idea with P2P networks Architecture | 5 |

## Repositories: `mehotkhan`

| Repo | Visibility | Kind | Primary language | Last push | Notes |
| --- | --- | --- | --- | --- | --- |
| `safarnak.app` | Public | Source | TypeScript | 2026-05-14 | AI-powered offline-first travel companion. |
| `BandersnatchInteractive` | Public | Source | JavaScript | 2025-12-16 | Interactive HTML5 video player; 225 stars and 64 forks. |
| `safarnak-worker` | Public | Source | None | 2025-10-20 | Safarnak worker shell or placeholder. |
| `Nekonymous` | Public | Source | TypeScript | 2025-04-29 | Anonymous Telegram messaging bot on Cloudflare Workers. |
| `nostr-relay` | Private | Source | TypeScript | 2024-10-18 | Private Nostr relay experiment. |
| `zcalendar` | Public | Source | Vue | 2024-03-07 | Vue calendar project. |
| `totoro` | Public | Source | Vue | 2023-09-09 | Jamstack blog starter with Nuxt/Decap CMS. |
| `bagche` | Private | Source | HTML | 2023-02-25 | Private Bagche-related project. |
| `persian-word-cloud` | Public | Source | Python | 2021-12-20 | Persian word-cloud generator; 93 stars and 16 forks. |
| `persian-twitter-day` | Private | Source | Python | 2018-08-06 | Daily analysis of Persian-language tweets. |

## Repositories: `konar-studio`

| Repo | Visibility | Kind | Primary language | Last push | Notes |
| --- | --- | --- | --- | --- | --- |
| `Front-Page` | Public | Source | JavaScript | 2025-11-16 | Konar Studio front page at `konar.studio`. |
| `index` | Public | Source | Shell | 2022-05-28 | Index page repository. |
| `ESP01-Signaling-Server` | Public | Source | C++ | 2020-08-20 | ESP01 signaling server. |
| `Arduino-sound-sonar` | Private | Source | C++ | 2020-08-18 | Arduino sound sonar experiment. |

## Repositories: `bagche`

| Repo | Visibility | Kind | Primary language | Last push | Notes |
| --- | --- | --- | --- | --- | --- |
| `mamoochi` | Public | Source | Vue | 2025-05-19 | Mamoochi CMF at `mamoochi.bagche.app`. |
| `Front` | Public | Source | Vue | 2025-05-11 | Front page of Bagche. |
| `.github` | Public | Source | None | 2025-02-26 | Organization profile/readme repository. |
| `demo-repository` | Private | Source | HTML | 2025-02-26 | Demo repository. |
| `Home` | Private | Source, archived | Vue | 2024-11-15 | Previous Bagche home project. |

## Publication Plan

1. Confirm which private repositories can be mentioned publicly.
2. Merge duplicate or related repositories into single public stories instead of publishing one page per repository.
3. Keep `projects` pages for products, packages, public tools, and finished experiments.
4. Use `lab` notes for recurring technical themes, experiments, and architecture lessons.
5. After review, generate English project pages first, then lab notes that cross-link those projects.

## Content Production Checklist

- [x] Keep the reviewed inventory as a private draft.
- [x] Add project pages for the reviewed public candidates.
- [x] Attach GitHub repository links to each project page.
- [x] Add lab notes for the main engineering themes.
- [x] Add Mamoochi as an open-source Jamstack framework project.
- [x] Add Konar IoT experiments as a lab thread.
- [x] Add task checklists to project and lab notes.
- [ ] Review private repository mentions before publishing related lab notes.
- [ ] Add screenshots, diagrams, and architecture sketches.
- [ ] Generate matching Persian content after the English pages settle.
