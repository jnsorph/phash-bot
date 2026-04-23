# phash-bot

Discord moderation bot for detecting and blocking scam images with perceptual hashes.

## Features

- Detects image attachments with perceptual hashing.
- Stores known hashes in Redis.
- Provides an admin hash panel for managing blocked images.
- Supports a message context command to block images directly from a message.

## Requirements

- Node.js 20 or newer.
- npm.
- A running Redis instance.
- A Discord bot application with the required intents enabled.

In the Discord Developer Portal, enable:

- `Message Content Intent`
- `Server Members Intent`

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd phash
```

### 2. Install dependencies

```bash
npm install
```

This installs the app dependencies as well as the SWC compiler used for builds.

### 3. Start Redis

Use your local Redis instance or a hosted Redis URL.

Default local URL:

```text
redis://localhost:6379
```

### 4. Create your `.env` file

Copy `.env.example` to `.env` and fill in the values:

```bash
copy .env.example .env
```

Then edit `.env` and add:

```env
DISCORD_TOKEN=your-bot-token
REDIS_URL=redis://localhost:6379
PHASH_TRESHOLD=10
```

Notes:

- `DISCORD_TOKEN` is required.
- `REDIS_URL` defaults to `redis://localhost:6379` if omitted.
- `PHASH_TRESHOLD` controls how similar two hashes may be before an image counts as suspicious.

### 5. Configure and invite the bot

1. Create a bot user in the Discord Developer Portal.
2. Copy the bot token into `.env`.
3. Invite the bot to your server with permissions that allow it to read messages, register commands, and manage moderation actions as needed.

### 6. Run the project

For development:

```bash
npm run dev
```

For production build:

```bash
npm run build
```

Then start the compiled app:

```bash
npm start
```

## Scripts

- `npm run dev` - starts the bot with `tsx` in watch mode.
- `npm run build` - compiles TypeScript with SWC into `dist/`.
- `npm run typecheck` - runs `tsc --noEmit` for static type checking.
- `npm start` - runs the compiled bot from `dist/index.js`.

## Code Quality

The project now includes a standard professional toolchain:

- `npm run lint` - checks the code with ESLint.
- `npm run lint:fix` - automatically fixes lint issues where possible.
- `npm run format` - formats the project with Prettier.
- `npm run format:check` - checks formatting without changing files.
- `npm run check` - runs linting and type checking together.

Recommended workflow:

1. Run `npm run format` before committing changes.
2. Run `npm run check` to verify code quality.
3. Run `npm run build` to confirm the SWC output still compiles.

## Commands

After startup, the bot registers these moderation commands:

- `/hashpanel` - opens the panel for managing blocked image hashes.
- `Bild blockieren` - message context command for blocking an image from a selected message.

## Project structure

- `src/index.ts` - application entry point.
- `src/core/` - bot bootstrap and event wiring.
- `src/config/` - environment handling.
- `src/infrastructure/` - Redis and logging infrastructure.
- `src/modules/moderation/` - moderation commands, handlers, and the hash panel.
- `src/utils/` - perceptual hashing helpers.

## Notes

- The project uses package import aliases via `#@/...`.
- The build uses SWC, so type checking is intentionally separated into `npm run typecheck`.
- The `dist/` folder is generated and should not be edited manually.
