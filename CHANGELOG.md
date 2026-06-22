# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-22

### Added

- Typed osu! API v2 client with zero runtime dependencies
- OAuth2: client credentials, static token, authorization code flow
- 19 resource namespaces covering users, beatmaps, beatmapsets, rankings, chat, forum, multiplayer, and more
- Rich TypeScript types, discriminated unions, and runtime type guards for events and scores
- Client-side rate limiting, retries, and typed error hierarchy
- Pagination helpers (`paginateCursor`, `paginateJsonCursor`, `paginatePage`)
- Subpath exports: `otsuapi/errors`, `otsuapi/auth`
- Unit, guest (live API), and authenticated test suites
