# Agent rules

DueTogether: an Expo + TypeScript app for Florida Polytechnic students. Read `PLAN.md` for your lane, then `src/types.ts` for the shared data contract.

## Rules

- **Stack:** Expo + TypeScript (strict). The app must run in **Expo Go**, so use only modules that Expo Go bundles. No native code, no dev-build-only libraries.
- **Stay in your lane:** only edit the folders and files your lane owns in `PLAN.md`.
- **Never edit without asking:** `src/types.ts`, `src/config.ts`, `src/mockData.ts`, `package.json`, `package-lock.json`, `app.json`, and the navigation/root layout (`src/app/`, `src/components/app-tabs*.tsx`). The full list is in `PLAN.md` → Shared files. If you need a change there, stop and ask. Don't work around it.
- **No new packages without asking.** `expo-secure-store` and `jest-expo` are already installed. If you get approval for a package, add it with `npx expo install <package>`, never `npm install`.
- **Secrets:** never log, print, hardcode, or commit a Canvas access token or any other credential. Store tokens only with `expo-secure-store`. `.env` is gitignored. Keep it that way.
- **Before you finish a task:** run `npx tsc --noEmit` and `npm test`. Both must pass.
- **When your task is done:** commit your work on your branch, and add one line to `AI_USAGE.md` → Log in the format `- [time] [lane] [tool] – what was built`.

## Expo notes

Expo changes between SDK releases, so don't trust memory for Expo APIs. Check the `expo` major version in `package.json` and read the matching docs at `https://docs.expo.dev/versions/v<major>.0.0/` (index: https://docs.expo.dev/llms.txt).

- Routing uses Expo Router. Routes live in `src/app/`, which is shared, so put screen code in `src/screens/<Name>/` and export it from there.
- Import shared code with the `@/` alias (`@/types`, `@/mockData`, `@/config`).

```bash
npx expo start      # dev server (open in Expo Go)
npx tsc --noEmit    # typecheck
npm test            # jest (jest-expo preset)
npx expo lint       # lint
```
