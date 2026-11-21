# DueTogether

DueTogether is a mobile app (Expo + TypeScript) for Florida Polytechnic students that turns their Canvas workload into a way to study together. Students connect their Canvas account with a personal access token, which is stored securely on the device. The app then imports their upcoming homework, quizzes and exams from the Canvas planner and shows them on a calendar. From any assignment, or from a personal topic, students can post a study session, find classmates in the same course to study with, or start a project and recruit teammates.

## Run it

```bash
npm install
npx expo start   # then scan the QR code with Expo Go
```

Set `CANVAS_BASE_URL` in `src/config.ts`. If the Canvas API can't be reached, the app falls back to demo data.
