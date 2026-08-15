# Hookbook

A personal full-stack web app for songwriters to **store**, **tag**, and **search** song ideas, hooks, and rhyme schemes.

## Features

- JWT authentication (signup, login, logout)
- Idea CRUD with lyrics, genre, mood, BPM range, rhyme scheme, tags, and status
- Search and filter by keyword, tag, genre, mood, or status
- Random unfinished idea for creative unblocking
- Dashboard with counts by status and genre
- Syllable count per line and rhyme-scheme detection

## Stack

React + Vite + Tailwind CSS · Node.js + Express · SQLite

## Quick start

```bash
npm run install:all
cp server/.env.example server/.env
npm run dev
```

Open http://localhost:5173 (API on port 3001).

## API

| Method | Route | Description |
| ------ | ----- | ----------- |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/ideas` | List ideas |
| POST | `/api/ideas` | Create idea |
| GET | `/api/ideas/search` | Search/filter |
| GET | `/api/ideas/random` | Random unfinished idea |
| GET | `/api/ideas/dashboard` | Status and genre counts |
| GET | `/api/ideas/:id` | Get one idea |
| PUT | `/api/ideas/:id` | Update idea |
| DELETE | `/api/ideas/:id` | Delete idea |

All `/api/ideas/*` routes require `Authorization: Bearer <token>`.
