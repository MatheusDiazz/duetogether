# PLAN

Four lanes run in parallel, each in its own git worktree and branch. No two lanes own the same files. Paths are relative to the repo root, and all app code lives under `src/`.

## Shared files

No lane edits these without asking first:

- `src/types.ts`: the data contract (User, CanvasItem, StudySession, Project, Membership)
- `src/config.ts`: `CANVAS_BASE_URL`
- `src/mockData.ts`: fake data and the demo fallback
- `package.json`, `package-lock.json`, `app.json`, `tsconfig.json`
- Navigation and root layout: `src/app/**`, `src/components/app-tabs.tsx`, `src/components/app-tabs.web.tsx`
- `AGENTS.md`, `CLAUDE.md`, `PLAN.md`, `README.md`, `.gitignore`, `.gitattributes`
- `AI_USAGE.md`: append-only. Each lane adds one Log line per task and edits nothing else in it.

Screens are default-exported React components in `src/screens/<Name>/index.tsx`. Routes in `src/app/` get wired to them on `main` after lanes merge.

## Interfaces between lanes

Code against these signatures even before the other lane merges:

```ts
// A1: src/services/canvas
saveToken(token: string): Promise<void>
getToken(): Promise<string | null>
clearToken(): Promise<void>
fetchPlannerItems(opts: { startDate: string; endDate: string }): Promise<unknown[]>
//   raw planner item JSON, all pages; throws CanvasApiError { kind: 'unauthorized' | 'network' | 'http'; status?: number }

// A2: src/services/db
mapPlannerItem(json: unknown): CanvasItem | null   // null = not homework/quiz/exam, or malformed
getCanvasItems(range?: { startDate: string; endDate: string }): Promise<{ items: CanvasItem[]; source: 'canvas' | 'mock' }>
listSessions() / createSession(...) / listProjects() / createProject(...) / listMemberships(...) / joinTarget(...)
```

---

## A1: Canvas connection (Matheus, Claude Code)

**Owns:** `src/services/canvas/`, `src/screens/Onboarding/`

**Task:**
- Onboarding screen. Explain how to get a token (Canvas → Account → Settings → New Access Token), take the token in a secure text input, validate it with one API call, then save it.
- Token storage with `expo-secure-store` (`saveToken`, `getToken`, `clearToken`). The token is never logged, never shown after it's saved, and never committed.
- Canvas API client. `fetchPlannerItems` calls `GET {CANVAS_BASE_URL}/api/v1/planner/items?start_date=…&end_date=…&per_page=100` with `Authorization: Bearer <token>`, follows `rel="next"` in the `Link` header until there are no more pages, and returns the raw JSON.
- Error handling: map 401 → `unauthorized` (prompt the user to re-enter the token), network failure → `network`, other non-2xx → `http`. Error messages never include the token.

**Done when:**
- A real token can be entered, validated, saved, and reloaded after an app restart in Expo Go.
- `fetchPlannerItems` returns items from every page. A jest test with a mocked `fetch` covers 2+ pages joined by `Link` headers, plus a 401.
- Searching the code for `console.log` turns up nothing that could print the token.
- `npx tsc --noEmit` and `npm test` pass.

## A2: Data layer and Calendar (Matheus, Codex)

**Owns:** `src/services/db/`, `src/screens/Calendar/`

**Task:**
- Mapper `mapPlannerItem` from Canvas planner item JSON to `CanvasItem`. Detect the type from `plannable_type` (`quiz` and `assessment_question` → quiz; `assignment` → homework, unless `plannable.submission_types` includes `online_quiz` → quiz; title or assignment group says "exam", "midterm" or "final" → exam). Use `context_name` as `courseName`, `plannable.due_at` or `plannable_date` as `dueDate`, and `html_url` resolved against `CANVAS_BASE_URL` as `htmlUrl`. Skip announcements, discussions, calendar events and malformed items.
- Tests in `src/services/db/__tests__/` using sample planner API JSON fixtures (homework, quiz, exam, announcement, missing fields).
- Data layer: `getCanvasItems` calls A1's `fetchPlannerItems` plus the mapper, and falls back to `mockCanvasItems` (`source: 'mock'`) on any error. Add an in-memory store for sessions, projects and memberships, seeded from `mockData.ts`.
- Calendar screen: upcoming Canvas items grouped by day, with a type badge (homework/quiz/exam). Tapping an item opens `htmlUrl`. Show a visible "demo data" note when `source === 'mock'`.

**Done when:**
- Mapper tests pass for every fixture.
- The Calendar screen shows mock items in Expo Go, and shows real items once A1 is merged.
- `npx tsc --noEmit` and `npm test` pass.

## B1: Study sessions and partners (Mattias, Claude Code)

**Owns:** `src/screens/Sessions/`, `src/screens/Partners/`

**Task:**
- Sessions screen: a feed of study session posts, plus a create-session form with title, description, time, location or virtual, max participants, and a topic that is either a Canvas item or a personal topic. Users can join a session and see who's going.
- Partners screen: for a chosen Canvas item or course, list other users in that course and those already in related sessions. Users can invite a partner or request to join.
- Use `mockData.ts` until A2's `src/services/db` is merged, then switch to it.

**Done when:**
- In Expo Go you can create a session about a Canvas item and one about a personal topic, see both in the feed, join one, and find partners for a Canvas item.
- `npx tsc --noEmit` passes.

## B2: Projects and shared UI (Mattias, Codex)

**Owns:** `src/screens/Projects/`, `src/components/` (except `app-tabs.tsx` and `app-tabs.web.tsx`)

**Task:**
- Projects screen: a list of projects with status filters, a create-project form (title, description, topic as a Canvas item or personal, skills needed, max members), and a project detail view with members and a request-to-join button.
- Reusable cards in `src/components/cards/`: `CanvasItemCard`, `SessionCard`, `ProjectCard`, `UserCard`. Each takes the matching type from `src/types.ts` as props.
- Basic UI in `src/components/ui/`: `Button`, `TextField`, `Badge` (homework/quiz/exam colors), `EmptyState`.
- Use `mockData.ts` until A2's `src/services/db` is merged.
- Ship the cards early and keep their props stable, because the other lanes will import them.

**Done when:**
- In Expo Go you can create a project about a Canvas item or a personal topic, filter by status, and request to join.
- The cards render every mock record without errors.
- `npx tsc --noEmit` passes.
