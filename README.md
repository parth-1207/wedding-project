# Shaadi Planner
1. Push this folder to GitHub, then Netlify > Add site > Import from Git (or `npm i && npx netlify deploy --prod`).
2. Site settings > Environment variables: `APP_PASSCODE` (shared secret), `RESEND_API_KEY`, `FROM_EMAIL` (verified Resend sender).
3. Open the site > Settings > enter the same passcode. Everyone using that passcode sees the same live data.
Daily emails go out 8:30 AM IST (edit `schedule` in daily-digest.mjs).
