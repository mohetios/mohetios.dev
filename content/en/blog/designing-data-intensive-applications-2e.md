---
title: Designing Data-Intensive Applications, 2nd Edition
date: 2026-05-16
thumbnail: /content/designing-data-intensive-applications-2e.webp
description: Notes on Martin Kleppmann and Chris Riccomini's second edition of Designing Data-Intensive Applications, a broad map of reliable, scalable, and maintainable data systems.
tags:
- book-notes
- data-systems
- distributed-systems
- replication
- stream-processing
---

The guarantees of a data system become visible when an edit is saved, a machine fails, or two replicas disagree. _Designing Data-Intensive Applications_ explains the mechanisms behind those outcomes. Martin Kleppmann and Chris Riccomini's second edition provides a vocabulary for reasoning about data architecture beyond a particular vendor.

## Understanding the Tradeoffs

Data models, storage engines, replication, consistency, transactions, distributed coordination, batch processing, and streams are examined through their implications for reliability, scale, and maintainability.

This makes the book valuable for connecting infrastructure to product behavior. Consistency affects when a change becomes visible; schemas, event formats, and migration decisions can constrain future work long after the original code has been replaced.

## Reading and Returning to It

Backend and product engineers will find a substantial reference for questions about durability, ordering, freshness, and recovery. Individual chapters become especially useful when a concrete design decision gives the theory a context.

## Get the Book

- Official site: [Designing Data-Intensive Applications](https://dataintensive.net/)
