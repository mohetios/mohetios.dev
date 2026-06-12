---

title: Personal Publishing Systems  
description: Notes on the evolution from personal front pages to Git-backed Nuxt publishing systems and the current Mohetios.dev workshop.  
date: 2019-10-07  
updated: 2026-06-12  
status: Active  
tags:
- jamstack    
- nuxt
- content-systems
- cloudflare-pages
- static-sites
- personal-publishing
- git-backed-content

---

The recurring project was never only “make a website.”

It was always closer to this:

build a personal publishing system that stays useful after the first design fades.

A design fades quickly.  
A homepage gets old.  
A framework changes.  
A CMS becomes inconvenient.  
A domain changes meaning.  
A portfolio stops matching the person behind it.

But the need remains.

A place to write.  
A place to keep notes.  
A place to publish work.  
A place to document projects before they become polished case studies.  
A place where old ideas do not disappear just because the interface around them changed.

That is the thread behind several repositories:

- [mehotkhan/totoro](https://github.com/mehotkhan/totoro)
    
- [mehotkhan/front](https://github.com/mehotkhan/front)
    
- [mehotkhan/front_old](https://github.com/mehotkhan/front_old)
    
- [mehotkhan/Inbox](https://github.com/mehotkhan/Inbox)
    
- [mehotkhan/mohetios.dev](https://github.com/mehotkhan/mohetios.dev)
    

They are not the same project, but they belong to the same pattern.

Each one is an attempt to answer the same quiet question:

How should a technical person keep a public memory of their work?

## The Website Was Never Enough

A normal personal website usually starts with identity.

Who am I?  
What do I do?  
Where can people contact me?  
What projects should I show?

That is useful, but it is not enough.

A real personal site starts becoming valuable when it can hold time.

Not only the polished version of a person, but the movement:

- old experiments
    
- technical notes
    
- unfinished research
    
- project decisions
    
- dead ends
    
- migrations
    
- small tools
    
- public drafts
    
- current focus
    
- contact flow
    
- writing archive
    
- work that is not yet easy to name
    

This is why I keep returning to publishing systems.

A portfolio shows what is ready.

A publishing system can also show what is becoming.

That distinction matters for Mohetios.

Mohetios.dev is not only a place to present finished work. It is a place where ideas, notes, experiments, and product systems can slowly unfold into useful software.

## The Early Front Page Pattern

The older front pages were closer to identity surfaces.

They were attempts to make a public home: a place for name, projects, links, experiments, and a technical persona.

That kind of site has a familiar pressure.

At first, the design matters most. The homepage needs to feel right. The visual language needs to match the person behind it. The links need to be clear. The page needs to say: this is me, this is what I do, this is where my work lives.

But after the first version, the real pressure changes.

The question becomes:

Can this site keep growing?

Can it hold notes?  
Can it hold projects?  
Can it hold writing?  
Can it hold old experiments without making them look like current product promises?  
Can it change without losing its archive?

That is where a front page becomes a publishing problem.

A good personal site cannot stay only a landing page. It needs an archive model.

## Totoro: Git-Backed Jamstack as a Writing Surface

Totoro was an important step because it treated the site as a Jamstack publishing surface.

The stack was Nuxt, Decap CMS, Cloudflare Pages, static generation, and Git-backed content.

The important part was not only the technology.

The important part was the contract:

content should live close to the repository.

That contract matters.

If writing lives only inside a database, a dashboard, or a proprietary CMS, it can become difficult to move later. If the interface dies, the content becomes trapped behind the system that used to manage it.

Git-backed publishing changes that relationship.

The content is still files.  
The history is still visible.  
The site can be rebuilt.  
The CMS can be removed.  
The renderer can change.  
The archive survives.

Decap CMS was useful because it provided an editorial UI over Git. It made writing feel more approachable without forcing the content to leave the repository.

That is the right shape for many personal publishing systems:

a friendly editing layer, but not a content prison.

## Front Old: Personal Site as Experiment Container

The archived `front_old` project shows another branch of the same thinking.

It was not only a personal front page. It also carried experiments around Jamstack, Nuxt, WebRTC, GUNDB, Web3, NFT marketplace ideas, Cloudflare Pages, and P2P network concepts.

That mix may look messy from the outside, but it says something useful.

A personal site often becomes the place where unrelated experiments first touch each other.

Publishing.  
Identity.  
P2P ideas.  
Content ownership.  
Web3 experiments.  
Realtime interfaces.  
CMS workflows.  
Frontend architecture.

These are not all the same product, but they can live inside the same workshop phase.

The lesson is not that every personal website should contain every experiment.

The lesson is that a personal publishing system needs a way to separate states of work.

A current project should not look like an old prototype.

A lab note should not look like a finished product.

A research fragment should not look like a client-ready service.

A retired experiment should still be readable without pretending to be active.

This became one of the design rules for Mohetios:

separate the content types because different kinds of work age differently.

## The Content Model Matters

One bucket is not enough.

If every piece of content is just a “post”, the site becomes unclear.

A tutorial is not the same as a lab note.  
A project page is not the same as a case study.  
An about page is not the same as a manifesto.  
A technical article is not the same as a changelog.  
A contact page is not the same as a product surface.  
An unfinished experiment is not the same as an active service.

Mohetios needs separate content types because the site has separate responsibilities.

Blog posts are for long-form writing, technical essays, tutorials, and reflective notes.

Lab notes are for experiments, prototypes, unfinished systems, research fragments, and project archaeology.

Projects are for public-facing work that needs a clearer shape, context, repository link, demo link, and current status.

Pages are for stable identity and site-level promises: about, contact, maybe now and principles.

Tags are not decoration. They are a memory layer. They let old notes reappear as part of a larger thread.

This model is simple, but it protects the site from becoming a pile of markdown files.

The content system should not only render prose.

It should explain the relationship between pieces of work.

## Mohetios.dev: The Current Workshop

Mohetios.dev is the current version of this long-running publishing system.

It is more than a portfolio.

It is a personal engineering notebook, bilingual public site, content archive, project surface, and lightweight operations system.

The public side holds:

- blog posts
    
- lab notes
    
- project writeups
    
- about and contact pages
    
- tags
    
- newsletter signup
    
- moderated comments
    
- technical identity
    

The private side holds:

- inbox
    
- leads
    
- comments moderation
    
- newsletter subscribers
    
- analytics
    
- notifications
    
- owner workflows
    

That combination is important.

A personal publishing system is not only about rendering markdown. It also needs to handle what happens after publishing.

People read.  
People reply.  
People contact.  
People comment.  
People subscribe.  
People send opportunities.  
People ask questions.

So the site becomes both publication and reception.

That is why the inbox matters.

A personal site without a contact system is a static sign.

A personal site with a small, owned inbox becomes a working surface.

## From CMS to Pipeline

The current Mohetios content system moved away from a traditional CMS layer and toward a build-time content pipeline.

The idea is simple:

write Markdown, validate it, transform it, and render it through the site.

Velite fits this direction because it treats content as typed data. Markdown and frontmatter are not loose files that the UI discovers casually at runtime. They are source records that go through a build pipeline.

That gives the site a few advantages:

- content schemas can be explicit
    
- broken frontmatter can fail early
    
- generated data can be typed
    
- table of contents and syntax highlighting can be prepared before runtime
    
- public pages can be prerendered
    
- the frontend can read compiled content instead of parsing raw Markdown on every request
    

This is closer to how I want Mohetios to work.

The writing remains file-based and portable.

The app still gets a structured content layer.

The build step becomes the editor between prose and interface.

## Git Is The Memory Layer

Git is not a perfect writing tool.

It is not as comfortable as a dedicated editor. It can be noisy. It was built for code, not essays. It does not automatically make writing better.

But for a technical publishing system, Git has one deep advantage:

it remembers change.

That matters for personal work.

A note can start rough and become clearer.  
An old project can be rewritten as a case study.  
A lab fragment can move into a project page.  
A draft can become a public article.  
A Persian version can appear after the English one.  
A technical idea can be edited months later without losing its history.

Git makes writing feel less like a final upload and more like a working record.

For Mohetios, that is the right model.

The site should not only publish finished thoughts. It should let thoughts mature.

## Bilingual Publishing Is Not Translation Only

Mohetios is bilingual: English and Persian.

That is not only a localization feature.

It changes the publishing system.

English and Persian do not always need to carry the same sentence structure. Some ideas should be translated directly. Some should be rewritten. Some should be more technical in English and more human in Persian. Some should keep the same structure because the archive needs parity.

A bilingual personal site needs a content model that respects both.

The UI labels can live in i18n files.  
The prose should live as prose.  
The Persian version should be allowed to sound Persian.  
The English version should be allowed to sound natural in English.  
The two versions should be connected, but not forced into mechanical symmetry.

This is especially important for Mohetios because part of the site is professional, part of it is personal, and part of it is philosophical.

The system should support translation, but the writing should not feel translated.

## The Homepage Problem

A homepage is difficult because it wants to become everything.

A portfolio.  
A résumé.  
A blog index.  
A dashboard.  
A feed.  
A product page.  
A personal manifesto.  
A contact funnel.

If it tries to do all of that equally, it becomes weak.

The homepage of a personal publishing system should answer a smaller set of questions:

What is this place?  
What is active now?  
What can I read?  
What has this person built?  
How do I go deeper?  
How do I contact them?

It should show motion without becoming a dashboard.

That is the balance I want for Mohetios.

The homepage should feel alive, but calm.

It should show current focus, recent writing, selected lab notes, and public projects. It should not expose every metric, every admin action, or every unfinished idea.

The dashboard belongs behind the owner surface.

The homepage belongs to readers.

## Archive Over Feed

A feed is useful for freshness.

An archive is useful for memory.

A personal publishing system needs both, but the archive is more important over time.

The feed says: what is new?

The archive says: what has this person been thinking about for years?

Mohetios should not become a social feed. It should become a structured archive of work.

That means old content needs care:

- stable URLs
    
- clear dates
    
- updated dates
    
- status labels
    
- tags
    
- project links
    
- repository links
    
- related notes
    
- language variants
    
- migration notes
    
- honest context when an old idea changed
    

This is why lab notes matter.

They let old work remain visible without pretending to be final.

## Status Is Part Of The Content

A publishing system should not only store title, date, and body.

It should also store the state of the work.

Some useful statuses:

- Active
    
- Refining
    
- Exploring
    
- Archived
    
- Paused
    
- Shipped
    
- Deprecated
    

Status is not bureaucracy. It is reader orientation.

If someone opens an old note, they need to know whether it is current thinking, historical context, an unfinished experiment, or a retired idea.

This is especially important for technical work.

A 2019 implementation may still teach a useful pattern, but it may not represent the current stack.

A 2021 P2P experiment may still show product thinking, but it may not be a maintained product.

A 2026 Mohetios article may represent the current architecture.

Status lets the site be honest.

## Writing As Infrastructure

The most important shift is this:

writing is infrastructure.

Not marketing.  
Not decoration.  
Not a task after the real work.

Writing is how a project becomes understandable.

A technical project without writing is hard to trust.  
An old experiment without notes is hard to recover.  
A system without tradeoffs is hard to evaluate.  
A portfolio without context is hard to remember.  
A public identity without writing is easy to flatten.

Mohetios is built around the opposite idea.

Write the context.  
Write the decisions.  
Write the tradeoffs.  
Write the failed paths.  
Write what changed.  
Write what should be done next.

The written layer makes the system durable.

## Design Rules For The Current System

The current direction can be reduced to a few rules.

### 1. Keep content close to Git

The repository should remain the source of truth for long-form content.

Editing tools can improve the workflow, but they should not trap the archive.

### 2. Separate content types

Blog, lab, projects, pages, and tags should remain distinct because they age differently.

### 3. Make publishing boring

The path from commit to deploy should be predictable.

A personal publishing system should not require emotional energy every time something is published.

### 4. Keep prose portable

Markdown is not perfect, but it is durable enough.

Content should be readable outside the application.

### 5. Let old work stay visible

Old experiments should not be deleted just because they are no longer current.

They should be labeled, contextualized, and connected to newer thinking.

### 6. Treat the site as a workshop

The site should hold finished work and unfinished work without confusing the two.

### 7. Keep the owner surface separate

Public readers need clarity.

The owner needs operations: inbox, leads, comments, subscribers, analytics, notifications.

Those should support each other without becoming the same interface.

### 8. Write in two languages with respect

Persian should not feel like machine-translated English.

English should not lose precision.

Both should belong to the same workshop.

## What Comes Next

The next version of this system should focus less on redesign and more on publishing quality.

The core is already there.

Now the work is to make the archive stronger:

- migrate old content carefully
    
- write project histories
    
- add related-note links
    
- improve lab status labels
    
- connect projects to articles
    
- add architecture diagrams
    
- keep Persian and English versions natural
    
- make the writing loop comfortable from Obsidian or a Git-based editor
    
- document the Mohetios content pipeline
    
- preserve old front page experiments as part of the public story
    

The goal is not to keep rebuilding the site.

The goal is to make the site strong enough that future work can accumulate inside it.

A good personal publishing system should survive redesigns.

It should survive framework changes.

It should survive shifts in professional identity.

It should keep the work readable long after the first interface is gone.

## Open Questions

There are still useful questions to answer:

- Which old front page content should be migrated into Mohetios?
    
- Which old repositories should become lab notes, and which should remain archived quietly?
    
- Should project pages be manually written, generated from repository metadata, or both?
    
- How should related notes connect across blog, lab, and project pages?
    
- Should the site support draft previews from content branches?
    
- How should Obsidian fit into the writing workflow?
    
- Should the dashboard include a content review queue later?
    
- How much metadata is enough before the writing process becomes heavy?
    
- How should old content show its historical context without feeling stale?
    
- What belongs in public writing, and what belongs only in private notes?
    

These are not only content management questions.

They are questions about how a person keeps a public memory of their work.

## Task Checklist

-  Compare Totoro’s Decap CMS model with the current Velite content pipeline.
    
-  Add a short architecture diagram for the Mohetios.dev publishing flow.
    
-  Decide where `front`, `front_old`, and `Inbox` belong in the public story.
    
-  Write migration notes for moving old content into the current `content/en` and `content/fa` structure.
    
-  Add status definitions for lab and project pages.
    
-  Add related-note links between blog, lab, and project content.
    
-  Create a content migration checklist for old repositories.
    
-  Define a stable frontmatter schema for blog, lab, projects, and pages.
    
-  Add an Obsidian-friendly writing workflow that still uses Git as the source of truth.
    
-  Document how publishing works from Markdown file to deployed page.
    
-  Review old personal-site experiments and label them as archive, lab, or project history.
    

The recurring project is not making another website.

It is building a durable publishing system for technical memory.

Mohetios.dev is the current version of that system:

a Git-backed workshop where writing, projects, experiments, notes, and public identity can keep unfolding without losing their history.