# Hangman Game — Backend

Lightweight backend for a Hangman game with user authentication, game lifecycle endpoints, achievements tracking, and a cron-driven AI word generator.

This project exposes a simple REST API used by a Hangman front-end. It includes:

- User sign-up / login with JWT cookies
- Game creation and end-game reporting

- Achievement definitions and tracking
- An AI-powered word generator (uses OpenAI) that can be run from a cron job

## Table of contents

- Project overview
- Features

- Quick start
- Environment variables
- API endpoints

- Database & seeding
- Cron / AI word generation
- Known issues & notes

- Contributing
- License

## Project overview

The server is an Express app (CommonJS). Key files:

- `app.js` — Express app and route registration
- `server.js` — loads env, connects to MongoDB and starts the server (also requires the cron job)
- `controllers/` — request handlers for auth, users, game and achievements

- `routes/` — route definitions and middleware wiring
- `models/` — Mongoose models: `User`, `Achievement`, `Word`
- `services/aiGenWord.js` — helper that uses OpenAI to generate a batch of words

- `cron/wordGenerator.js` — scheduled job that calls the AI generator periodically
- `scripts/seedAchievements.js` — seed script to populate achievements collection

## Features

- JWT-based authentication (token in cookie or Authorization header)
- Create game (fetch a random word by category)
- End game endpoint that updates user stats and checks for unlocked achievements

- Protected routes for user data and achievements
- AI generation script for populating words (OpenAI)

## Quick start

1. Install dependencies

```bash
npm install
```

2. Create a `config.env` in the project root with required environment variables (see below).

3. Run in development

```bash
npm run dev
# or
node server.js
```

The server listens on `PORT` (default 4000).

## Environment variables

Create a `config.env` file and set at minimum the following variables used by the code:

- `NODE_ENV` — e.g. `development`
- `PORT` — e.g. `4000`

- `DATABASE` — MongoDB connection string template (contains `<db_password>` placeholder) e.g. `mongodb+srv://user:<db_password>@.../dbname`
- `DATABASE_PASSWORD` — password value used to replace `<db_password>` in `DATABASE`
- `JWT_SECRET_KEY` — secret used to sign JWTs

- `EXPIRES_IN` — JWT expiration value (e.g. `90d`)
- `JWT_COOKIE_EXPIRES_IN` — cookie expiry in days (e.g. `7`)
- `OPENAI_API_KEY` — API key for the OpenAI client used by `services/aiGenWord.js` (optional if you won't generate words)

Example `.env` (not checked in):

```
NODE_ENV=development
PORT=4000

DATABASE=mongodb+srv://user:<db_password>@cluster0.xxxxx.mongodb.net/hangman
DATABASE_PASSWORD=supersecret
JWT_SECRET_KEY=verysecretvalue

EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=7
OPENAI_API_KEY=sk-...

```

Security note: never commit `config.env` or real secrets to the repository.

## API Endpoints

Base path: `/api/v1`

Auth

- POST `/api/v1/auth/signup` — Create user

  - Body: `{ "username": "string", "password": "string", "confirmPassword": "string" }`
  - Response: `{ status: 'success', token, data: { user } }` (cookie `jwt` is set)

- POST `/api/v1/auth/login` — Log in

  - Body: `{ "username": "string", "password": "string" }`
  - Response: `{ status: 'success', token, data: { user } }`

- POST `/api/v1/auth/logout` — Clears the `jwt` cookie

Users

- GET `/api/v1/users/:userID/profile` — protected, returns the user's profile
  - Requires Authorization: `Bearer <token>` header or cookie `jwt`

Settings

- GET `/api/v1/settings` — protected, returns current user's settings
- PATCH `/api/v1/settings` — protected, update settings (body shape used in controller)

Game

- GET `/api/v1/game?category=<category>` — Get a random word for a game (public)

  - Query: `category` — string (example categories: `animals`, `sports`, `tv-shows`, `movies`, `capital-cities`, `countries`)
  - Response (success): `{ status: 'success', data: { word, id, category, hint, difficulty, length } }`

- POST `/api/v1/game` — Create a new word entry (controller currently uses `Words.create(req.body)`) — likely admin-only in practice

  - Body: word object matching `models/wordsModel.js`

- POST `/api/v1/game/end` — protected, report end of a game; updates user stats and resolves achievements
  - Body: `{ won, usedHint, wrongGuesses, duration, gameData }`
  - Response: player stats, `newAchievements` array, `rank`, `totalAchievements`

Achievements

- GET `/api/v1/achievements` — protected, list available achievements

Notes about endpoints and expected payloads

- The controllers and models show the expected fields. For `end` the controller expects `gameData` containing at least `category` and `difficulty` to update achievement progress.
- The `updateSettings` controller currently expects an `id` param but the route registers `PATCH '/'` (no id). Consider changing the route to include the user id, or make the controller use `req.user.id` for the authenticated user.

## Database & seeding

The project uses MongoDB via Mongoose. Models are in `models/`.

To seed achievements into the `achievements` collection run:

```bash
node scripts/seedAchievements.js
```

This script reads `data/achievements.js` and inserts them into MongoDB. Ensure `config.env` has correct DB connection values before running.

## Cron job and AI word generation

- `cron/wordGenerator.js` schedules a job using `node-cron` to run the AI word generator on the first day of each month at midnight (cron expression `0 0 1 * *`). The generator uses OpenAI via `services/aiGenWord.js`.
- `services/aiGenWord.js` calls the OpenAI `responses.create` method and expects to parse a JSON array of word objects. Currently the code logs the generated words and shows where you can `insertMany` into the `Words` collection (the DB insert is commented out). If you enable insertion, make sure your categories and schema match.

Important: `services/aiGenWord.js` expects `OPENAI_API_KEY`. The cron loader requires the generator module; verify the imported symbol is a function (the file imports / usage has a small mismatch in `cron/wordGenerator.js` where the `require` result may not be destructured). Review before running in production.

## Known issues & notes

- `models/wordsModel.js` uses category names like `"animals"` and `"tv-shows"` while the AI prompt uses slightly different category names (e.g. `"tv shows"` vs `"tv-shows"`). When importing AI-generated words, normalize category strings to match the schema.
- `userController.updateSettings` expects `req.params.id` but the route registers `PATCH '/'` with no id — this will likely fail. Either change the route to `PATCH '/:id'` or change the controller to use `req.user.id`.

- `services/email.js` is present but empty — sign-up mentions sending a welcome email; you'll need to implement this if desired.
- Cron/AI generator code logs results but currently does not persist generated words (insertion is commented out).
- The `cron/wordGenerator.js` imports the AI generator without destructuring; if the generator exports an object, calling it directly will fail. See `services/aiGenWord.js` which uses `module.exports = { generateWordPerCategory }` — require usage should match that export.

## Tests

There are no automated tests in the repository. Add unit and integration tests for controllers, auth flows, and achievement logic. Use Jest or Mocha + Supertest for endpoint tests.

## Contributing

1. Fork the repo
2. Create a feature branch

3. Run tests / linter and ensure no regressions
4. Open a pull request with a clear description

If you want me to open PRs fixing the small issues above (route params, cron import, AI DB insertion), tell me which to prioritize and I can implement them.

## License

ISC

## Contact / Support

If you need help wiring the front-end to these endpoints, adding tests, or making the AI generation robust, I can implement the changes. Suggested next steps:

- Fix the route/controller mismatch for settings
- Ensure AI generator normalizes category names and inserts into DB

- Implement `services/email.js` for welcome emails
- Add endpoint tests for auth, game creation, and end-of-game logic

---
