# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3/Vite app backed by Firebase. Application code lives in `src/`.
Route views are in `src/views/`, reusable receipt components are in
`src/components/`, and shared helpers are in `src/functions.js`. Firebase setup is
centralized in `src/firebase.js` and anonymous auth helpers in `src/auth.js`.

Firebase configuration and rules live at the repository root: `firebase.json`,
`firestore.rules`, `storage.rules`, and `firestore.indexes.json`. Public static
assets are in `public/`; receipt screenshots are in `prints/`. SDD specs and
security notes are under `docs/`.

## Build, Test, and Development Commands

- `npm install`: install project dependencies.
- `npm run dev`: start the local Vite dev server.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the built app locally.
- `npm run test:rules`: run Firestore and Storage security-rule tests with the
  Firebase Emulator.
- `npm audit`: check dependency vulnerabilities.

## Coding Style & Naming Conventions

Use Vue single-file components with `<script setup>`. Keep indentation at four
spaces in existing Vue and JavaScript files. Prefer clear Portuguese UI text,
matching the current app language. Use camelCase for variables and functions,
PascalCase for Vue components, and route view filenames ending in `View.vue`.

There is no formatter or linter configured yet, so keep changes minimal and
consistent with nearby code.

## Testing Guidelines

The current automated tests cover Firebase security rules in
`scripts/test-firebase-rules.mjs`. Add rule tests when changing Firestore or
Storage access patterns. Run `npm run build`, `npm audit`, and
`npm run test:rules` before handing off security or Firebase-related changes.

Manual browser testing is still required for camera, geolocation, IP lookup, and
Firebase project configuration.

## Change Traceability

Every code change, including features, bug fixes, hotfixes, refactors, and
configuration changes, must be reflected in the related project guidance before
handoff. Update the relevant docs, README sections, AGENTS instructions, SDD
specs, and automated or manual tests/checks in the same change whenever behavior,
commands, configuration, security posture, or developer workflow is affected.

## Commit & Pull Request Guidelines

Recent commits use short Portuguese summaries, for example
`Atualiza documentação das specs...`. Prefer concise, imperative summaries that
name the area changed.

Pull requests should include a brief description, linked issue when applicable,
verification commands run, screenshots for UI changes, and notes about Firebase
rules, indexes, or environment variables that must be deployed.

## Security & Configuration Tips

Do not commit `.env.local` or secret values. Keep `.env.example` as the public
template. Anonymous Auth must be enabled in Firebase. When changing evidence
capture or access rules, update `docs/security.md` and the relevant SDD spec.
