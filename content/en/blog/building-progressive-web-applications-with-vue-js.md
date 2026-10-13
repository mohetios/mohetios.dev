---
title: Building Progressive Web Applications with Vue.js
thumbnail: /content/Building-Progressive-Web-Applications-with-Vuejs.webp
date: 2021-09-11T16:33:46.294Z
description: Notes on building Vue-powered progressive web apps with service workers, offline support, manifests, IndexedDB, background sync, and push notifications.
tags:
- book-notes
- vue
- pwa
- service-workers
- offline-support
- browser-storage
---

A progressive web app needs a defined response to interrupted connectivity. _Building Progressive Web Applications with Vue.js_ follows that problem through a Vue application, connecting the interface with browser features for local data, offline use, and installation.

## The Application Beyond the Network

Service workers, caching, manifests, IndexedDB, background sync, and push notifications form the core material. Together they explain how data can remain available between visits and how the application reconnects with its backend.

The book is useful for treating these APIs as product behavior. Cache freshness, pending changes, and synchronization status affect what the user can trust and continue doing when a connection fails.

## Using the Examples

Frontend developers can use it to understand PWA foundations in a concrete project. The toolchain is older, so setup code and browser support need checking against current documentation. The enduring lesson is to define offline behavior, rather than stop at adding installation support.

## Get the Book

- Apress: [Building Progressive Web Applications with Vue.js](https://www.apress.com/gp/book/9781484253335)
