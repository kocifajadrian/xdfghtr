# Ubian web (redesign demo)

React 19 + TypeScript + Vite, styled with Tailwind CSS v4 and shadcn/ui (Radix). Design drafts are in `../designs/`.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script              | What it does                                                 |
| ------------------- | ------------------------------------------------------------ |
| `npm run build`     | type-check + production build into `dist/`                   |
| `npm run typecheck` | TypeScript only                                              |
| `npm run lint`      | oxlint                                                       |
| `npm run format`    | Prettier, rewrites files (`format:check` only checks)        |
| `npm test`          | Vitest, one run (`test:watch` re-runs on change)             |
| `npm run check`     | lint + format check + typecheck + tests (run before pushing) |

CI (`.github/workflows/ci.yml`) runs lint, format check, typecheck, tests and build on every push and pull request.

Demo login (mock API): `adrian.kocifaj@gmail.com` / `demo1234`.

## Structure

```
src/
  main.tsx               entry point
  app/                   App (router + providers), routes.tsx, providers.tsx, ErrorBoundary
  config/                env.ts (the only reader of import.meta.env), navigation.ts (routes + menu)
  features/
    auth/                everything about signing in (see below)
  components/
    ui/                  shadcn components (generated, edit freely)
    layout/              SiteHeader, AccountMenu, PreferenceButtons, PreferenceItems, ThemeSwitch, MobileNav, PageLayout
    brand/               Logo (a redraw, not used yet)
    PlaceholderCard.tsx  card for screens that are not built yet
  pages/                 thin route pages: HomePage, PlaceholderPage, NotFoundPage
  lib/                   http.ts (API client), theme.ts (light/dark/system), utils.ts
  test/setup.ts          Vitest setup (browser API stand-ins for jsdom)
```

A feature folder owns its screens, state, API calls and tests, and exposes a small public API through
`index.ts`. Other code imports from `@/features/auth`, never from its inner files.

```
features/auth/
  api.ts                 login() (mock or real), User, AuthError
  validation.ts          login form rules (+ tests)
  AuthProvider.tsx       signed-in user state   useAuth.ts / auth-context.ts
  LoginDialogProvider.tsx  state of the login popup   useLoginDialog.ts / login-dialog-context.ts
  RequireAuth.tsx        guard for pages that need a login
  components/            LoginDialog (popup), LoginForm (+ tests)
  index.ts               public API
```

New features (planner, tickets, card) get their own folder in `features/` the same way.

## Pages and the login popup

`config/navigation.ts` is the single list of pages: the router and the header menu both read it.
There is no login page. The popup opens from the "Prihlásiť sa" button, and when a signed-out visitor opens
a protected page (`protected: true` there). After login they continue to that page. Protected routes are
wrapped in `RequireAuth` in `app/routes.tsx`. Unknown addresses show a not-found page.
The header has the menu on the left and the controls on the right. Right side, signed out: theme, language,
log in. Signed in: theme, language, account menu (email, cart, sign out). The menu shows in full from 1024px wide: hovering a group
shows its pages, and clicking the group title opens its first page. Below that it becomes a menu button that
opens the same items in a side panel from the left (`components/layout/MobileNav.tsx`, shadcn Sheet). There a
group title is a link to the first page and its arrow expands the group's pages below it.

## Languages (i18n)

The app has Slovak, English, German, Polish, Ukrainian and Hungarian texts (in that menu order). Only Slovak is switched on for now; the others show greyed out in the menu. Turn one on with `enabled: true` in `i18n/languages.ts`. The switch is in the header (`components/layout/PreferenceButtons.tsx`):
each language starts with its flag (small inline SVGs in `components/brand/Flag.tsx`, because emoji flags show as
letters on Windows). The choice is saved in `localStorage` (`ubian.lang`); first visit follows the browser language,
else Slovak. `<html lang>` and the page description follow the choice.

All texts live in `src/i18n/messages/`: `sk.ts` is the source and defines the keys, `en.ts` and `pl.ts` must have the
same keys (a missing one is a TypeScript error). In components use `const { t } = useI18n()` and `t('login.title')`;
`t('home.titleSignedIn', { name })` fills `{name}` placeholders; `formatEuro(amount)` formats money per language.
To add a language: add `xx.ts`, add it to `LANGUAGES` in `i18n/languages.ts` and draw its flag in `Flag.tsx`.
Page addresses stay Slovak in every language.

## Environment and the real API

Copy `.env.example` to `.env` (git-ignored).

| Variable            | Meaning                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `VITE_API_URL`      | Base URL of the Ubian API. Empty = use the built-in mock API (demo mode).    |
| `VITE_USE_MOCK_API` | Optional `true` / `false`. Default: mock is on when `VITE_API_URL` is empty. |

With `VITE_API_URL` set, `features/auth/api.ts` calls `POST {API}/auth/login` with `{ email, password }` and
expects `{ "email": string, "name": string }` back. HTTP 400 or 401 becomes a "wrong e-mail or password" message.
This contract is a placeholder: change the path and shape there to match the real API. All requests go through
`lib/http.ts` (JSON, cookies included, typed `ApiError`).

Not done yet: logout call to the server, session refresh, and storing the session in an httpOnly cookie
(the mock keeps the user in localStorage or sessionStorage).

## Tests

Vitest + Testing Library. Tests sit next to the code (`*.test.ts(x)`):

- `validation.test.ts`: login form rules
- `LoginForm.test.tsx`: errors, wrong password, success, show/hide password
- `app/routes.test.tsx`: protected pages open the login popup, signed-in users see them, 404, old `/login` link

## shadcn

Components live in `src/components/ui/`. Add more with `npx shadcn@latest add <name>`. The project uses
the stock look (style `radix-vega`, neutral colours, Inter, black dark theme). Change colours in
`src/index.css` (`:root` for light, `.dark` for dark).

## Notes

- Logo is a redraw (`components/brand/Logo.tsx`), not shown yet. Replace it with the official vector.
- Google and Facebook buttons are placeholders (no real sign-in).
- English, German, Polish, Ukrainian and Hungarian texts are a first draft written by Claude. Have a native speaker check them before the pitch.
