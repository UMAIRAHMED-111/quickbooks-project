---
name: frontend-development
description: >
  Guides all frontend development to follow consistent, production-ready architecture across every project. Trigger this skill whenever the user asks to build a new page, feature, component, chart, hook, API integration, or frontend project. Also trigger when adding routes, state management, data fetching, forms, auth flows, or any UI work in a React codebase. Use this to enforce the canonical stack, patterns, and conventions so all repos stay aligned.
---

# Frontend Development Skill

This skill defines the standard architecture, stack, and conventions for all frontend projects. Follow these patterns consistently so every repo feels familiar and maintainable.

---

## Stack

| Layer | Library | Notes |
|---|---|---|
| Framework | React 19 + Vite | Default for all new projects |
| Routing | React Router v7 | BrowserRouter + layout routes |
| Server state | TanStack Query v5 | All API data |
| Global UI state | Zustand | Cross-component UI state, not server data |
| Local UI state | React `useState` / `useReducer` | Component-scoped only |
| Forms | React Hook Form + Zod | Validation schema-first |
| Charts | Recharts | Wrapped in pure components |
| UI primitives | shadcn/ui | Add via `npx shadcn@latest add` |
| Styling | Tailwind CSS v4 | Utility-first, CSS variables for tokens |
| Icons | Lucide React | Consistent icon set |
| Toasts | Sonner (via shadcn) | Top-right, richColors |

---

## Directory Structure

```
src/
├── app/
│   └── providers.tsx          # QueryClient, Zustand hydration, Toaster
├── components/
│   ├── layout/                # Shell, header, nav, sidebar
│   ├── ui/                    # shadcn primitives — managed by shadcn, don't edit manually
│   └── {domain}/              # Shared display components (cards, skeletons, errors)
├── features/
│   └── {feature}/
│       ├── {Feature}Page.tsx  # Route target
│       ├── hooks/             # TanStack Query hooks for this feature
│       ├── components/        # Components used only by this feature
│       └── store.ts           # Zustand slice if this feature needs global UI state
├── hooks/                     # Global reusable hooks (useMediaQuery, useDebounce, etc.)
├── lib/
│   ├── api.ts                 # All fetch functions + ApiRequestError
│   ├── utils.ts               # cn() and other pure utilities
│   ├── format.ts              # Currency, number, date formatters
│   └── validators.ts          # Shared Zod schemas
├── store/
│   └── index.ts               # Root Zustand store (if app-wide state needed)
└── types/
    └── index.ts               # Shared interfaces and API response types
```

---

## Routing

Single layout route wrapping the persistent shell, page routes nested inside:

```tsx
<BrowserRouter>
  <Routes>
    <Route element={<AppShell />}>
      <Route index element={<HomePage />} />
      <Route path="/feature" element={<FeaturePage />} />
      <Route path="/feature/:id" element={<FeatureDetailPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

- One file per page: `{Feature}Page.tsx` in `src/features/{feature}/`
- Lazy-load heavy pages with `React.lazy` + `<Suspense>`
- 404 handling: add a catch-all `<Route path="*" element={<NotFound />} />`

---

## State Management

Three layers — use the right one, don't mix responsibilities:

### 1. Server State → TanStack Query

Everything that comes from an API. Handles caching, deduplication, background refresh, loading/error states automatically.

```ts
export function useItems() {
  return useQuery({
    queryKey: itemKeys.list(),
    queryFn: getItems,
    staleTime: 60_000,
  })
}
```

Use mutations with cache invalidation on success:
```ts
export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  })
}
```

Always define a **query key factory** per feature:
```ts
export const itemKeys = {
  all: ['items'] as const,
  list: () => [...itemKeys.all, 'list'] as const,
  detail: (id: string) => [...itemKeys.all, id] as const,
}
```

### 2. Global UI State → Zustand

Use Zustand when state needs to be shared across unrelated parts of the tree and has nothing to do with server data. Good fits:

- Modal/drawer open state
- Sidebar collapsed state
- Active theme / user preferences
- Multi-step form wizard progress
- Notification queue
- Shopping cart / selections not yet synced to server

```ts
// src/features/modals/store.ts
interface ModalStore {
  activeModal: string | null
  open: (name: string) => void
  close: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  activeModal: null,
  open: (name) => set({ activeModal: name }),
  close: () => set({ activeModal: null }),
}))
```

Keep slices small and co-located with the feature that owns them. Only promote to `src/store/` if truly app-wide.

**Don't use Zustand for**: data that lives on the server (use TanStack Query), state that only one component needs (use `useState`).

### 3. Local UI State → useState / useReducer

Anything scoped to a single component: input values, toggle states, hover, focus, animation triggers. Keep it local — don't lift unnecessarily.

Use `useReducer` when local state has multiple sub-values or transitions that depend on each other.

---

## Data Fetching

### API Layer (`src/lib/api.ts`)

- All fetch calls live here — never `fetch()` directly in hooks or components
- Export one typed function per endpoint
- `ApiRequestError` class stores `status` and `body` for structured handling
- Read base URL from env: never hardcode origins

```ts
export class ApiRequestError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message)
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`)
  if (!res.ok) throw new ApiRequestError(res.status, await res.json(), res.statusText)
  return res.json()
}
```

---

## Forms

Use React Hook Form + Zod. Define the schema first, derive the type from it:

```ts
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})
type FormValues = z.infer<typeof schema>

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })
}
```

- Zod schemas for reusable validation go in `src/lib/validators.ts`
- Form-specific schemas stay co-located with the form component
- Never manually validate in submit handlers — let Zod do it

---

## Component Conventions

### Page Structure

```tsx
export function FeaturePage() {
  const data = useFeatureData()

  return (
    <div className="space-y-8">
      <SectionHeader title="..." description="..." />
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <ChartCard title="..." loading={data.isLoading} error={data.error}>
          {data.data ? <FeatureChart data={data.data} /> : null}
        </ChartCard>
      </div>
    </div>
  )
}
```

- Hooks at top, render below
- Always delegate loading and error states to wrapper components — never handle inline

### Chart Components (`src/components/charts/`)

- Accept typed `data` prop — no fetching inside
- Use `ResponsiveContainer` from Recharts
- Return `null` on empty data
- Import all colors from a central theme file — never hardcode hex

### Shared Display Components

Keep a set of consistent wrappers in `src/components/{domain}/`:
- **ChartCard** — wraps charts, handles loading skeleton / error / empty states
- **KpiCard** — single metric display
- **SectionHeader** — page section title + description
- **BlockError** — error display with icon
- **Skeleton** variants — from shadcn

---

## Styling

### Tailwind CSS v4

- All layout, spacing, and typography via Tailwind utilities
- Use CSS variables (defined in `index.css`) for all colors — reference via `bg-background`, `text-foreground`, `border-border`, etc.
- Never hardcode hex/rgb values in JSX

### Design Tokens (`index.css`)

Define in `@layer base` using oklch:

```css
:root {
  --background: oklch(...);
  --foreground: oklch(...);
  --primary: oklch(...);
  --muted-foreground: oklch(...);
  --border: oklch(...);
  --radius: 0.625rem;
}
```

### Layout Patterns

- Page container: `mx-auto max-w-7xl px-4 md:px-6`
- Responsive grids: `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4`
- Card shadow: define once in `dashboard-styles.ts`, import everywhere
- Numbers/currency: `tabular-nums` class always
- Hover lift: `transition-transform hover:-translate-y-0.5`

---

## TypeScript Conventions

- API response interfaces in `src/types/` named `{Entity}Response`
- Array item types named `{Entity}Item` or `{Entity}Row`
- Mark optional fields `?` — be resilient to extra server fields
- Avoid `any` — use `unknown` and narrow at boundaries
- Infer hook return types from `useQuery` — don't annotate manually

---

## Path Aliases

Always use `@/` — never relative imports across feature or component boundaries:

```ts
import { ChartCard } from "@/components/dashboard/ChartCard"
import { useFeatureData } from "@/features/feature/hooks/useFeatureData"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
```

Configure in `vite.config.ts` and `tsconfig.json`:
```ts
// vite.config.ts
resolve: { alias: { "@": path.resolve(__dirname, "./src") } }
```

---

## Error Handling

- Wrap the app (or major sections) in a React `ErrorBoundary`
- `ApiRequestError` carries `status` for specific handling (401 → redirect to login, 503 → service unavailable banner)
- TanStack Query retry config: no retry on 400/401, max 2 retries otherwise
- Always show a recoverable UI on error — never a blank screen

---

## Performance

- Lazy-load heavy routes: `const Page = React.lazy(() => import('./features/heavy/HeavyPage'))`
- Memoize expensive derivations with `useMemo` — but only when profiling shows it helps
- `useCallback` for callbacks passed to memoized children only
- Avoid premature optimization — profile first

---

## React 19 Patterns

### `use()` for promises and context

`use()` can unwrap a promise or context value inside a component — including conditionally (unlike hooks):

```tsx
// Unwrap a promise inside a Suspense boundary
function UserName({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // suspends until resolved
  return <span>{user.name}</span>
}

// Read context conditionally
function Theme() {
  if (someCondition) {
    const theme = use(ThemeContext)
  }
}
```

### `useOptimistic` for instant UI feedback

Apply an optimistic update immediately, automatically rolled back if the mutation fails:

```tsx
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (current, newItem: Item) => [...current, newItem]
)

async function handleAdd(item: Item) {
  addOptimistic(item)          // instant UI update
  await createItem(item)       // actual server call
}
```

Use this for any action where you want the UI to feel instant: adding items, toggling likes, marking as done.

### `ref` as a prop (no more `forwardRef`)

In React 19, `ref` is a regular prop. Remove `forwardRef` wrappers:

```tsx
// React 19
function Input({ ref, ...props }: React.ComponentProps<'input'>) {
  return <input ref={ref} {...props} />
}

// Old (React 18) — don't use this anymore
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => ...)
```

---

## Suspense Boundaries

Use `useSuspenseQuery` from TanStack Query to move loading state out of components and into Suspense boundaries. This keeps components clean — they always render with data:

```tsx
// Hook — use useSuspenseQuery instead of useQuery
export function useItems() {
  return useSuspenseQuery({
    queryKey: itemKeys.list(),
    queryFn: getItems,
    staleTime: 60_000,
  })
}

// Component — no loading check needed
function ItemList() {
  const { data } = useItems() // always has data here
  return <ul>{data.map(item => <li key={item.id}>{item.name}</li>)}</ul>
}

// Page — Suspense + ErrorBoundary wrap the component
function ItemsPage() {
  return (
    <ErrorBoundary fallback={<BlockError />}>
      <Suspense fallback={<ItemListSkeleton />}>
        <ItemList />
      </Suspense>
    </ErrorBoundary>
  )
}
```

- Place `<Suspense>` as close to the async component as possible — don't wrap the whole page in one boundary
- Always pair `<Suspense>` with `<ErrorBoundary>` — a rejected promise surfaces as an error boundary catch
- `useQuery` (with manual `isLoading` checks) is fine for simple cases; `useSuspenseQuery` is better for deeply nested or parallel data dependencies

---

## Optimistic Updates

For mutations where you want instant feedback before the server responds:

```ts
export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateItem,
    onMutate: async (updated) => {
      // Cancel any in-flight refetch that would overwrite optimistic state
      await qc.cancelQueries({ queryKey: itemKeys.list() })
      // Snapshot current state for rollback
      const previous = qc.getQueryData(itemKeys.list())
      // Apply optimistic update
      qc.setQueryData(itemKeys.list(), (old: Item[]) =>
        old.map(item => item.id === updated.id ? { ...item, ...updated } : item)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Roll back on failure
      qc.setQueryData(itemKeys.list(), context?.previous)
    },
    onSettled: () => {
      // Always refetch to sync with server truth
      qc.invalidateQueries({ queryKey: itemKeys.list() })
    },
  })
}
```

Use optimistic updates for: toggling state, reordering, inline edits, any action where the success rate is high and the latency is noticeable.

---

## Auth Patterns

### Token storage

- **Prefer `httpOnly` cookies** — not accessible to JS, immune to XSS
- If using `localStorage` (e.g. token-based SPAs without a BFF): accept the XSS risk and mitigate with strict CSP
- Never store tokens in React state or Zustand — they won't survive a page refresh

### Auth state

Keep auth state in a Zustand slice. Hydrate it from cookies/localStorage on app load:

```ts
interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

### Protected routes

Wrap protected routes with a guard component that redirects to login if unauthenticated:

```tsx
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

// In App.tsx
<Route element={<RequireAuth><AppShell /></RequireAuth>}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```

### 401 handling

In `api.ts`, catch 401 responses globally and redirect to login:

```ts
if (!res.ok) {
  if (res.status === 401) {
    useAuthStore.getState().setUser(null)
    window.location.href = '/login'
  }
  throw new ApiRequestError(res.status, await res.json(), res.statusText)
}
```

---

## Testing

### Stack

| Tool | Purpose |
|---|---|
| Vitest | Unit + component test runner |
| React Testing Library | Component rendering + interactions |
| MSW (Mock Service Worker) | API mocking at the network layer |
| `@testing-library/user-event` | Realistic user interactions |

### What to test

- **Custom hooks** — test via `renderHook`, assert return values and state transitions
- **User interactions** — render a component, simulate real user actions (click, type, submit), assert visible output
- **API error states** — use MSW to return error responses, assert the UI handles them correctly

### What not to test

- Implementation details (internal state, method calls)
- Rendering output of shadcn/Recharts primitives — they're already tested upstream
- Every prop combination — test behaviour, not configuration

### Setup

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

```ts
// src/test/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)
```

### Example

```ts
it('shows error message when fetch fails', async () => {
  server.use(http.get('/api/items', () => HttpResponse.error()))
  render(<ItemsPage />)
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
})
```

### Vitest config

```ts
// vite.config.ts
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,
}
```

---

## Adding a New Feature — Checklist

1. Add API function(s) to `src/lib/api.ts`
2. Add response type(s) to `src/types/`
3. Create `src/features/{feature}/hooks/use{Feature}.ts` with query key factory + hooks
4. Create `src/features/{feature}/{Feature}Page.tsx`
5. Add chart component(s) to `src/components/charts/` if needed
6. Add Zustand slice at `src/features/{feature}/store.ts` if cross-component UI state is needed
7. Register route in `App.tsx`
8. Add nav entry in `AppShell.tsx` with Lucide icon
