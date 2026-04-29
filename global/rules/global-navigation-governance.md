# Global Navigation Governance

## Purpose

App navigation must be predictable. Users should be able to trust that "back" goes to the previous screen and nothing else. Admin functionality must never interfere with user browsing. This rule codifies the navigation architecture so every new feature composes cleanly with existing flows.

## Non-negotiable principles

1. **Every screen has exactly one owning tab (or admin group).** Screens physically live under the folder of their owning tab. No screen is reachable as a direct child of more than one Stack.
2. **Back pops within the local Stack only.** Use React Navigation's default back button (configured via the Stack layout's `headerBackTitle`). Do not implement custom back logic that inspects route names, referrers, or parent navigators.
3. **Tab switching resets nested Stacks.** Every nested Stack tab sets `popToTopOnBlur: true` so accumulated history is cleared when the user leaves the tab.
4. **Reselecting the current tab may reset that tab to its hub.** If the user is already inside a deeper sub-screen for that tab, a tab reselect may use an explicit root reset (`router.replace` to the tab hub) so the current tab behaves like a normal app tab instead of staying stranded on a nested page.
5. **Cross-tab navigation uses `router.navigate` for tab hubs and `router.push` for sub-screens.** Navigating to a different tab root should be a clean tab switch. Opening a deeper screen should preserve that tab's stack history.
6. **Admin is a separate navigator group.** Admin routes live under `app/(admin)/`, grouped into sub-Stacks by section. Admin has no inbound links from user tabs except the explicit "Enter Admin" button; admin exits back to user tabs only via the explicit "Exit" button (uses `router.dismissTo`).
7. **Hub screens hide the header back button.** Every tab's index (Stack root) overrides `headerLeft: () => null`. Tab-level navigation is handled by the tab bar, not by a back arrow.

## Folder structure contract

Each tab that is a nested Stack owns a folder named after the tab:

```
app/(tabs)/<tab>/
├── _layout.tsx        # Stack with default back
├── index.tsx          # Hub screen — overrides headerLeft to null
├── <sub-screen>.tsx   # Owned sub-screens
└── <nested-group>/    # Optional: further nested Stacks for multi-level flows
    ├── _layout.tsx
    ├── index.tsx
    └── [id].tsx
```

Admin follows the same pattern, grouped by dashboard section:

```
app/(admin)/
├── _layout.tsx          # Stack with default back + exit button on header-right
├── index.tsx            # Admin dashboard — overrides headerLeft to null
├── <section>/
│   ├── _layout.tsx
│   └── <screen>.tsx
```

## Rules for new features

When adding a new screen:

1. **Decide its owning tab first.** If no single tab owns it cleanly, rethink the feature. Do not place a screen that "belongs to both Health and Progress" in a shared folder — pick one and link from the other with `router.navigate`.
2. **Place the file under that tab's folder.** `app/(tabs)/profile/<my-screen>.tsx`, not `app/(tabs)/settings/<my-screen>.tsx` unless it is a preferences/account screen genuinely owned by the "More" tab.
3. **Do not add custom `headerLeft` unless hiding the back button on a Stack root.** The Stack's default back is correct for every other case.
4. **`router.push` for all navigations to sub-screens, regardless of which tab they live in.** `router.push` always pushes onto the target Stack so the hub remains underneath and back works. `router.navigate` to a sub-screen *replaces* the stack entry — the hub disappears and back breaks. Use `router.navigate` only for navigating to a tab hub index (e.g. `/(tabs)/chat`, `/(tabs)/performance`) where you want a clean tab switch without any sub-screen history. Rule of thumb: if the destination URL has more than two path segments (e.g. `/(tabs)/settings/guide`), use `router.push`. If it is just the tab root (e.g. `/(tabs)/performance`), use `router.navigate`.
5. **If the user reselects the current tab from a deeper sub-screen, use `router.replace` to the tab hub.** This is the sanctioned stack-reset exception for tab reselect only. Do not use it for ordinary forward navigation.
6. **Do not import `useNavigation` to call `goBack()` manually.** If you are writing a cancel button that mirrors back behavior, use the shared `useSettingsBack()` hook. Do not invent new back hooks.
7. **Never call `router.back()`.** It is ambiguous across navigators. Use `router.push` / `router.navigate` / `router.replace` / `router.dismissTo` with explicit destinations, or rely on the header back button.

## Rules for admin features

1. **Admin is a peer of tabs, not a child.** Admin entry is `router.push('/(admin)')`. Admin exit is `router.dismissTo(getLastMainTab())`.
2. **Admin sub-sections get their own folders.** Place each new admin screen under the folder matching its dashboard section (`operations/`, `people/`, `ai-runtime/`, `governance/`, `broadcast/`, or at admin root for standalone utilities).
3. **Every admin screen is accessible from the admin dashboard tile grid.** Register it in `ADMIN_DASHBOARD_TILES` (lib/admin-dashboard.ts) with its correct sub-group route.
4. **Cross-admin links use `router.push` within the admin group.** Never push to a user tab from within admin except through the explicit exit flow.

## Rules for hooks and helpers

1. **`useSettingsBack()`** (lib/hooks/useSettingsBack.ts) is the only sanctioned back hook for in-screen cancel buttons. It wraps `navigation.goBack()` with a `canGoBack()` guard. Do not add per-surface variants.
2. **`getLastMainTab()` / `setLastMainTab()`** (lib/navigation-state.ts) exist only to support admin exit. Do not use them for user-tab back navigation.
3. **Do not introduce referrer tracking, global back-destination state, or custom navigation state machines.** If back behavior feels complicated, the folder structure is wrong — fix that instead.

## Validation

When shipping a new screen or nav change, walk through this matrix by hand on a device:

1. Enter the screen from every tab/surface that links to it. Press back. Confirm you land on the expected tab's hub.
2. Enter the screen, switch tabs via the bottom bar, switch back. Confirm you land on the tab's hub (not mid-flow).
3. If the screen is admin, enter from the admin dashboard, press back, confirm you return to the dashboard. Use the exit button, confirm you return to the user tab you came from.
4. For any new `router.push` call, confirm it stays within the current tab's Stack. For cross-tab links, confirm `router.navigate` is used.

## Navigation call reference

| Destination | Correct call | Why |
|---|---|---|
| Tab hub index (e.g. `/(tabs)/performance`) | `router.navigate(...)` | Switches tab cleanly, no Stack history |
| Sub-screen in any tab (e.g. `/(tabs)/settings/guide`) | `router.push(...)` | Pushes onto target Stack, hub stays underneath, back works |
| Reselect current tab from a deeper sub-screen | `router.replace(<tab-root>)` | Resets that tab to its hub without leaving the nested page in browser/history state |
| Admin entry | `router.push('/(admin)')` | Admin sits above tabs on root stack |
| Admin exit | `router.dismissTo(getLastMainTab())` | Pops admin off root stack |

**Rule of thumb:** destination has 3+ path segments → `push`. Destination is a tab root → `navigate`.

## Anti-patterns (do not ship)

- `router.navigate('/(tabs)/settings/guide')` for a sub-screen — **replaces** the Stack, hub disappears, back breaks. Use `router.push`.
- `router.back()` with or without a fallback — ambiguous across navigators.
- A `navigation.getState()` walker that reads parent-navigator state to decide where back goes.
- A referrer string stored in module-level state or a store.
- A custom `headerLeft` component that inspects the current route.
- A sub-screen that sets `headerBackVisible: false` and re-implements back (unless it provides its own full-screen navigation UI with working skip/back buttons).
- Screens that deep-link into a different tab's folder (`app/(tabs)/settings/goals.tsx` when Goals is a Health feature).
- A `tabPress` listener that calls `router.navigate(tabIndex)` — this pushes a new root entry and breaks back.
- An unconditional `tabPress` listener that resets a tab even when the user is already on that tab's hub.
- A `tabPress` listener that dispatches `POP_TO_TOP` across tabs instead of targeting the current tab's own hub reset.
- A `setTimeout` before a navigation call — never acceptable.

## Change log

New navigation rules are added as the product evolves. When a nav pattern is proposed that cannot be expressed with the current principles, update this document first, then implement. Never implement a one-off workaround and skip the rule update.
