---
title: Designing Data-Intensive Applications, 2nd Edition
date: 2026-05-16
thumbnail: /content/designing-data-intensive-applications-2e.webp
description: Notes on Martin Kleppmann and Chris Riccomini's second edition of Designing Data-Intensive Applications, a broad map of reliable, scalable, and maintainable data systems.
tags:
  - books
  - distributed-systems
  - databases
  - data-engineering
---

## Reading Notes

_Designing Data-Intensive Applications_ is the kind of book that changes how an engineer hears product requirements.

The surface topic is data systems: storage engines, replication, consistency, transactions, streams, batch processing, and distributed coordination. The deeper value is the way the book trains you to ask better questions before choosing infrastructure.

For product engineering, this matters because most product problems eventually become data problems:

- What should be the source of truth?
- Which reads must be fresh, and which can be stale?
- What happens when a write succeeds in one place and fails somewhere else?
- Is the system optimized for transactions, analytics, sync, search, or workflow?
- Which failure modes are acceptable to users?

The second edition is useful because modern architecture has moved further into cloud services, managed databases, serverless systems, data platforms, and AI-adjacent workloads. The old fundamentals still matter, but the decision surface is wider.

## Useful Ideas

### Architecture Is Tradeoff Management

The book is strongest when it refuses easy answers. Reliable systems are not built by picking the popular database. They are built by understanding the shape of the data, the latency budget, the expected failures, and the operational model.

### Data Outlives Code

Code can be replaced more easily than data. Schema decisions, event formats, migration paths, and retention rules become long-term product constraints. This is a good reminder to design data flows with future readers and future migrations in mind.

### Distributed Systems Are Product Design

Consistency models are not only backend theory. They decide what users see after saving, editing, sharing, syncing, or collaborating. A product that hides these decisions still exposes them through confusing behavior.

## Why I Keep It Nearby

This is a reference book for moments when a system starts growing beyond a single database and a single request cycle. It helps turn vague architecture discussions into concrete questions about durability, ordering, isolation, observability, and recovery.

## Get the Book

- Official site: [Designing Data-Intensive Applications](https://dataintensive.net/)
