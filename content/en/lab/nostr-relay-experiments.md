---

title: Nostr Relay Experiments  
description: Notes on private TypeScript relay work, a Cloudflare relay experiment, and reading an Erlang Nostr implementation as a protocol reference.  
date: 2024-03-18  
updated: 2026-06-12  
status: Private review  
tags:
- nostr
- relay-architecture
- decentralized-protocols
- cloudflare-workers
- websockets
- protocol-design
---

The Nostr repositories are less a finished product and more a protocol study.

That is the right way to frame them.

A relay looks small from the outside. It accepts connections, receives events, answers subscriptions, stores some data, forwards some messages, and rejects what it should not accept.

But small protocol surfaces can hide large architectural decisions.

A relay is not a social network.  
It is not a full application server.  
It is not the owner of user identity.  
It is not the only source of truth.

And still, it has power.

It decides what it stores.  
It decides what it forwards.  
It decides which clients are rate-limited.  
It decides what is blocked, what is accepted, and what is ignored.  
It decides how honest it is about its own limits.

That makes relay implementation a useful architecture exercise.

Related repositories:

- private `mohetios/nostr-relay`
    
- private `mohetios/cloudflare-nostr-relay`
    
- [mohetios/nostr](https://github.com/mohetios/nostr), a fork of an Erlang implementation
    

## Why Relays Are Interesting

Nostr is interesting because it separates identity from the server.

Users publish signed events. Clients can talk to multiple relays. Relays can store, reject, forward, or serve events without becoming a central account provider.

That shifts the architecture question.

In a normal application, the backend owns most of the product truth. It owns accounts, sessions, posts, permissions, and often the social graph.

In Nostr, the relay is more limited and more replaceable.

But limited does not mean simple.

A relay still has to understand enough of the protocol to behave correctly:

- receive client messages over WebSocket
    
- validate event shape
    
- verify event IDs and signatures where required
    
- process subscription filters
    
- return stored events
    
- forward new matching events
    
- close or reject invalid subscriptions
    
- answer writes with useful acceptance or rejection messages
    
- publish relay metadata
    
- apply rate limits and storage policy
    
- protect itself from spam and expensive queries
    

The architecture becomes interesting because the relay sits between two opposing forces.

It should be dumb enough to stay interoperable.

It should be smart enough to survive public traffic.

## The Relay As A Boundary

A relay is a boundary.

On one side, there are clients. They want to publish, subscribe, search, fetch history, and receive new events in real time.

On another side, there is storage. It may be SQLite, Postgres, KV, D1, object storage, an in-memory index, or something else.

On another side, there is policy. The relay may allow everything, require authentication, limit event kinds, block large payloads, reject old events, require proof of work, restrict writes, or only serve a private community.

On another side, there is the wider Nostr network. Other clients and relays may expect behavior that is not written in one application’s codebase but emerges from protocol convention.

That boundary is the project.

A relay implementation is not only a parser. It is a set of product and infrastructure decisions around a protocol.

## State Is The Hard Question

The first implementation temptation is to ask:

How do I receive an event and send it to subscribers?

That is the happy path.

The harder question is:

What state should the relay keep?

A relay can keep many kinds of state:

- active WebSocket connections
    
- subscription IDs per connection
    
- filters per subscription
    
- event storage
    
- author indexes
    
- kind indexes
    
- tag indexes
    
- per-IP rate limits
    
- per-pubkey rate limits
    
- auth challenges
    
- authenticated pubkeys
    
- blocked pubkeys
    
- moderation decisions
    
- relay settings
    
- supported NIPs
    
- retention policy
    
- recent duplicate event IDs
    
- backpressure and queue state
    

Each category has a different lifecycle.

Connection state is temporary.  
Subscription state belongs to one WebSocket.  
Event state may be durable.  
Auth challenge state may live for one connection.  
Rate-limit state may expire quickly.  
Moderation state may be durable.  
Relay metadata should be public and stable.  
Indexes should be shaped around query cost.

The key mistake is to flatten all state into one storage model.

A relay is easier to reason about when each state category has an explicit owner and lifetime.

## Subscriptions Are Not Ordinary Queries

A Nostr subscription is not only a database query.

It begins like a query because the relay returns stored events matching a filter. But after that, it becomes a live stream. New accepted events that match the subscription should be sent over the same connection until the subscription is closed, replaced, or the connection ends.

That makes subscriptions a hybrid object.

They are part query.  
Part stream.  
Part routing rule.  
Part connection-local state.

That shape is very different from a normal request-response API.

A REST endpoint can process one request and disappear. A relay connection keeps context. It has subscriptions, filters, backpressure, maybe auth state, maybe rate limits, and maybe client-specific behavior.

That is why the relay model is a useful WebSocket exercise.

The implementation is not only about accepting WebSockets. It is about managing live protocol state per connection.

## Validation Is A Product Decision

A relay can validate at different depths.

At minimum, it must reject malformed messages that cannot be processed.

But public relays need more than shape validation.

They need policy validation.

Examples:

- Is the event JSON valid?
    
- Is the event ID correct?
    
- Is the signature valid?
    
- Is the event too large?
    
- Is the created_at timestamp acceptable?
    
- Is this event kind allowed?
    
- Is this pubkey blocked?
    
- Is this client authenticated when authentication is required?
    
- Is this write rate-limited?
    
- Is this query too broad or too expensive?
    
- Should this relay store the event, forward it only, or reject it?
    

This is where “protocol implementation” becomes “relay operation”.

A toy relay can pass happy-path tests and still be dangerous under public traffic.

A responsible relay needs clear rejection reasons, machine-readable prefixes where expected, and limits that clients can understand.

## Relay Information Is Part Of The Contract

A relay should be able to describe itself.

This is not decoration.

Relay metadata tells clients what the relay claims to support, who operates it, what software it runs, what limitations it has, and which NIPs it understands.

That matters because Nostr is not one server and one client.

It is a network of partial implementations.

Clients need to adapt. Relays need to be honest. Operators need to publish limits before users discover them through failure.

A good relay information document can answer questions like:

- What is this relay for?
    
- Is it public or private?
    
- Does it require authentication?
    
- What event kinds does it accept?
    
- What are the rate limits?
    
- What are the storage limits?
    
- What NIPs are supported?
    
- Who operates it?
    
- What is the retention policy?
    
- What should clients not expect from this relay?
    

For my experiments, this becomes a design rule:

do not build a relay that cannot explain itself.

## Authentication Changes The Shape

Authentication in Nostr relays is interesting because identity already exists at the event layer.

Events are signed by keys. So why authenticate the connection?

Because relay policy sometimes needs to know who is currently connected, not only who authored a given event.

A relay may want to restrict writes, protect private event queries, limit certain subscriptions, or allow a pubkey to access resources only after proving control in the current session.

That creates a second layer:

- event signature proves authorship of an event
    
- relay authentication proves control of a key for this connection
    

Those are related, but not identical.

For a private relay, this distinction matters.

A private relay is not only checking whether an event is valid. It is deciding whether this connection is allowed to read or write according to local policy.

That is why NIP-42-style authentication belongs in the study even if the first implementation does not expose a public auth system.

## Abuse Controls Are Not Optional

A relay exposed to the public internet has to assume abuse.

Not theoretical abuse. Immediate abuse.

Broad filters.  
Large payloads.  
Duplicate events.  
Connection floods.  
Write spam.  
Expensive tag queries.  
Hot subscriptions.  
Clients that never close.  
Clients that do not respect limits.  
Events that are valid but unwanted.

So a relay needs controls before it needs features.

Useful controls include:

- maximum message size
    
- maximum filter count
    
- maximum subscription count per connection
    
- maximum filters per subscription
    
- maximum returned events per initial query
    
- event size limits
    
- connection rate limits
    
- write rate limits
    
- query complexity limits
    
- duplicate event detection
    
- blocked pubkeys
    
- blocked IP ranges if needed
    
- storage retention rules
    
- event kind allow/deny lists
    
- backpressure handling
    
- clear close and rejection messages
    

This is not admin polish.

It is the difference between a relay experiment and relay software.

## The Cloudflare Question

The Cloudflare relay experiment is interesting because relay workloads do not look exactly like ordinary request-response APIs.

Nostr relay traffic has long-lived WebSocket connections, per-connection subscriptions, fanout, storage, indexing, rate limits, and real-time delivery.

That creates a natural question:

Can an edge-first runtime host a responsible relay without becoming overcomplicated?

Cloudflare Workers are attractive because the HTTP and WebSocket surface can live close to users, deploy simply, and integrate with edge storage and Durable Objects.

Durable Objects are especially interesting because they can coordinate stateful WebSocket sessions. A Durable Object can own a shard of relay state, a room, a pubkey partition, a subscription coordinator, or a write pipeline. WebSocket hibernation makes the model more realistic because the runtime can keep connections open while avoiding constant active duration when nothing is happening.

But the edge model also forces discipline.

You cannot pretend in-memory state is permanent.  
You cannot treat every connection as if it belongs to a single long-running server process.  
You need to decide what wakes the system up.  
You need to persist what must survive hibernation.  
You need to index only what you can afford to query.  
You need to avoid global fanout designs that become expensive at scale.

That makes Cloudflare a good test environment for relay architecture.

It exposes the real design question:

Which part of a relay is connection state, which part is durable event history, and which part is policy?

## TypeScript Versus Erlang

The TypeScript experiments and the Erlang implementation are interesting for different reasons.

TypeScript is close to the product surface.

It fits Cloudflare Workers, web tooling, JSON parsing, WebSocket handlers, generated types, and fast iteration. It is good for building a relay experiment that can live near web infrastructure.

Erlang is close to the concurrency model.

A relay is naturally actor-like: many connections, many subscriptions, message passing, failure isolation, supervision, and long-running processes. Erlang and OTP are built around those ideas.

Reading an Erlang Nostr implementation is useful even if the target runtime is TypeScript.

It makes the concurrency shape visible.

Connections can be processes.  
Subscriptions can be supervised state.  
Relay modules can separate client, relay, and protocol logic.  
Failures can be isolated.  
Message flow can be treated as a first-class design object.

The lesson is not “rewrite everything in Erlang”.

The lesson is to steal the mental model.

When writing TypeScript relay code, it is still useful to think like a supervised message system:

- isolate connection state
    
- isolate protocol parsing
    
- isolate storage writes
    
- isolate fanout
    
- isolate policy checks
    
- recover cleanly from malformed clients
    
- never let one bad subscription poison the relay
    

That is the value of comparing the two.

## Interoperability Is More Than Happy Path

A relay that works with one test client is not necessarily interoperable.

Interoperability means surviving the messy edges of real clients:

- clients that send multiple filters
    
- clients that replace a subscription ID
    
- clients that send broad queries
    
- clients that expect EOSE
    
- clients that care about OK messages
    
- clients that handle machine-readable rejection prefixes
    
- clients that use relay information metadata
    
- clients that expect specific NIP support
    
- clients that reconnect aggressively
    
- clients that assume old relay behavior from another implementation
    

A protocol implementation has to be tested against other implementations, not only against its own assumptions.

For a public relay, compatibility is product quality.

If clients cannot understand your errors, your relay is not just strict. It is unfriendly.

If your relay claims support it does not really provide, it is not just incomplete. It is misleading.

If your relay accepts events it cannot store, it is not just permissive. It is unstable.

## What Should Stay Private

Because some of this work lives in private repositories, the public writing should avoid exposing implementation-specific details.

That means not publishing:

- infrastructure secrets
    
- exact deployment topology if it creates risk
    
- moderation or filtering rules that are easy to bypass
    
- private relay URLs
    
- internal allowlists
    
- unfinished security assumptions
    
- operational shortcuts
    
- code paths that are not ready for public traffic
    

But the protocol-level learning is publishable.

It is safe and useful to write about:

- relay responsibilities
    
- protocol message flow
    
- subscription lifecycle
    
- storage categories
    
- edge runtime constraints
    
- rate-limit strategy
    
- NIP support boundaries
    
- Cloudflare architecture questions
    
- TypeScript versus Erlang implementation tradeoffs
    
- what makes a relay responsible before it is public
    

That is the right public surface for this lab note.

## What I Learned

The main lesson is that a relay is small, but not shallow.

A relay is a protocol boundary, a storage policy, a real-time system, and a moderation surface at the same time.

It should not become a monolithic social backend.

But it also should not pretend that “dumb relay” means “no product responsibility”.

The interesting engineering is in the balance:

validate enough, but do not invent a private protocol.  
store enough, but do not become a data hoarder.  
support clients, but do not let clients define your failure mode.  
stay simple, but not naive.  
be interoperable, but honest about limits.

That is why these repositories belong in the lab.

They are not a finished relay product.

They are a study in protocol-shaped software.

## Open Questions

There are still useful questions to answer before any public release:

- Which NIPs should the relay actually support?
    
- Which NIPs should be explicitly unsupported?
    
- Should the relay be public, private, invite-only, or local-only?
    
- What storage backend is appropriate for each event kind?
    
- Which indexes are necessary for real client filters?
    
- How should broad filters be limited?
    
- How should duplicate events be detected and answered?
    
- Should authentication be required for writes, reads, or both?
    
- How should relay metadata describe real limits honestly?
    
- What rate limits should apply per IP, per pubkey, and per connection?
    
- What should survive restart, deployment, or Durable Object hibernation?
    
- How should fanout be modeled without global shared memory?
    
- Which implementation details are safe to publish?
    
- Should this become a public lab series or remain an internal architecture note?
    

These questions are not secondary.

They are the relay.

## Task Checklist

-  Review private relay code before publishing any implementation details.
    
-  Extract protocol-level notes that do not expose private infrastructure.
    
-  Map NIP-01 message flow into a relay lifecycle diagram.
    
-  Draft a NIP-11 relay information document for the experiment.
    
-  Decide whether NIP-42 authentication belongs in the first public version.
    
-  Define the relay’s supported and unsupported NIP list.
    
-  Write limits for message size, filters, subscriptions, returned events, and event size.
    
-  Design rate limits by IP, pubkey, and connection.
    
-  Separate connection state, subscription state, event storage, policy state, and relay metadata.
    
-  Compare TypeScript and Erlang implementation choices in a short technical note.
    
-  Test the relay against multiple clients, not only internal fixtures.
    
-  Decide whether Cloudflare Durable Objects should own connection groups, pubkey partitions, or relay shards.
    
-  Document what must survive WebSocket hibernation.
    
-  Decide whether this should become a public lab series or remain an internal architecture note.
    

A Nostr relay is a small piece of software with a large design shadow.

That is what makes it worth studying.