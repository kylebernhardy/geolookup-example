# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an example Harper application that demonstrates how to use the [geolookup](https://github.com/kylebernhardy/geolookup) plugin. It has no application code of its own — it configures and exposes the geolookup plugin's endpoints via `config.yaml`.

## Commands

- `harperdb dev .` — start Harper dev server (serves on http://localhost:9926)
- `harperdb run .` — start Harper production server
- `npm install` — install dependencies (pulls geolookup from GitHub)

## Architecture

This project is a thin Harper application that delegates entirely to the geolookup plugin:

- `config.yaml` — Harper app config. Enables REST, loads the geolookup plugin, and configures which endpoints to expose and their URL paths.
- `package.json` — Only dependency is the `geolookup` plugin, installed from GitHub.

The geolookup plugin provides all tables (Location, Cell, DataLoadJob), resources (Geolookup, DataLoad), and data files. See the [geolookup README](https://github.com/kylebernhardy/geolookup) for full documentation.

## Plugin Configuration (config.yaml)

| Option | Description |
|--------|-------------|
| `exposeGeoService` | When `true`, exposes the reverse geocoding endpoint |
| `geoServiceName` | URL path for the geo endpoint (e.g. `'geo'` → `/geo`) |
| `exposeDataLoadService` | When `true`, exposes the data loading endpoint. Disable after seeding. |
| `dataLoadServiceName` | URL path for the data load endpoint (e.g. `'data'` → `/data`) |

## Workflow

- Always present a plan and get approval before making code changes.
