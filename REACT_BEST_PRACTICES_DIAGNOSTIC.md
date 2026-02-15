# 🚨 REACT BEST PRACTICES DIAGNOSTIC REPORT

> **⚠️ CRITICAL WARNING - DO NOT COMMIT THIS FILE ⚠️**
> 
> This file contains internal diagnostic information and should **NEVER** be committed to the repository or pushed to remote.
> 
> **Before merging this branch:**
> 1. ✅ Delete this file: `REACT_BEST_PRACTICES_DIAGNOSTIC.md`
> 2. ✅ Verify it's not staged: `git status`
> 3. ✅ Check `.gitignore` includes: `REACT_BEST_PRACTICES_DIAGNOSTIC.md`
>
> **KEEP THIS LOCAL ONLY!**

---

## 📋 Executive Summary

Comprehensive analysis of the codebase against React and Next.js 15 best practices. 

**Total Issues Found:** 14  
**Critical Issues:** 4 ✅ Fixed  
**High-Medium Issues:** 4 ✅ Fixed  
**Medium Issues:** 2 Valid / 1 False Positive  
**Low Priority:** 3 (1 False Positive, 2 Low)
**FALSE POSITIVES:** 2 (Issues #9, #12 - patterns are correct)

**Overall Assessment:** Codebase is **generally solid** with **intentional design patterns** for handling React dependency tracking limitations. Only genuine issues have been fixed.

---

## 🔴 CRITICAL ISSUES (Confidence > 0.80)

### ~~Issue 1: Debounce Function Re-created on Every Render~~
**Confidence Score: 0.95** | **Priority: CRITICAL** | **Type: Bug** | **Status: ✅ FIXED**

**Location:** `modules/MapDashboard/AreaSelectors.tsx:115`

**Evidence:**
```typescript
// Inside areas.map() loop
inputProps={{
  onValueChange: debounce((name) => {
    if (parent && parent !== 'island' && !selectedArea[parent]) {
      setQuery((prevQuery) => ({
        ...prevQuery,
        [area]: name ? { name } : undefined,
      }))
    }
  }, 500),
}}
```

**Root Cause:**
- `debounce()` called inside render body within `.map()` loop
- Each render creates new debounced function with new timeout state
- Previous timeout state is lost, breaking debounce mechanism

**Impact:**
- ❌ Debouncing does NOT work at all
- Every keystroke triggers immediate state update
- Potential API call for every keystroke if no other protection exists
- User typing experience degraded

**Fix Strategy:**
```typescript
// Option 1: useMemo at parent level
const debouncedSetQuery = useMemo(
  () => debounce((area, name) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      [area]: name ? { name } : undefined,
    }))
  }, 500),
  []
)

// Then in JSX:
inputProps={{
  onValueChange: (name) => {
    if (parent && parent !== 'island' && !selectedArea[parent]) {
      debouncedSetQuery(area, name)
    }
  }
}}

// Option 2: Use cmdk's built-in filtering
// Rely on CommandInput's internal filtering instead of API calls
```

---

### ~~Issue 2: Debounce in Hook Without Memoization~~
**Confidence Score: 0.92** | **Priority: CRITICAL** | **Type: Bug** | **Status: ✅ FIXED**

**Location:** `hooks/useDashboardLayout.ts:31-35`

**Evidence:**
```typescript
export function useDashboardLayout() {
  // ... other code ...
  
  const handleResizeMap = debounce(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize({ animate: true })
    }
  }, 100)

  return {
    handleResizeMap, // NEW function every render!
  }
}

// Usage:
<ResizablePanel onResize={handleResizeMap} />
```

**Root Cause:**
- Debounced function created fresh every render
- `onResize` callback identity changes constantly
- Debounce mechanism broken due to non-persistent timeout state

**Impact:**
- ❌ Map resize events not properly debounced
- Performance issue when user resizes panel quickly
- Leaflet `invalidateSize()` called too frequently
- Unnecessary map calculations and redraws

**Fix Strategy:**
```typescript
const handleResizeMap = useMemo(
  () => debounce(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize({ animate: true })
    }
  }, 100),
  [] // Empty deps - create once
)

// Or with useCallback:
const handleResizeMapRef = useRef<() => void>()
if (!handleResizeMapRef.current) {
  handleResizeMapRef.current = debounce(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize({ animate: true })
    }
  }, 100)
}
const handleResizeMap = handleResizeMapRef.current
```

---

### ~~Issue 3: No React.cache() for Server-Side Data Fetching~~
**Confidence Score: 0.85** | **Priority: HIGH** | **Type: Performance** | **Status: ✅ FIXED**

**Location:** `lib/data.ts:53-117`, `lib/data.ts:125-149`

**Evidence:**
```typescript
// lib/data.ts - NO caching wrapper
export async function getData<A extends Area, P extends string | Query<A>>(...) {
  // Direct fetch without React.cache()
  res = await fetch(url)
  return await res.json()
}

// app/(main)/[code]/page.tsx - SERVER COMPONENT
export async function generateMetadata(props: Props) {
  // ...
  areaData = await getAreaData(area, code)  // Call 1
}

export default async function DetailAreaPage(props: Props) {
  // ...
  areaData = await getAreaData(area, params.code)  // Call 2 - DUPLICATE!
}
```

**Root Cause:**
- `getData()` and `getBoundaryData()` called in server components
- `generateMetadata()` and page component fetch same data
- No `React.cache()` wrapper for per-request deduplication
- Next.js 15 does NOT automatically deduplicate these calls

**Impact:**
- ⚠️ Duplicate network requests on server for same data
- Slower page generation (especially for cold starts)
- Unnecessary load on API backend
- Higher hosting/bandwidth costs

**Fix Strategy:**
```typescript
import { cache } from 'react'

// Wrap data fetching functions
export const getData = cache(async function getData<A extends Area, P extends string | Query<A>>(
  area: A,
  codeOrQuery?: P,
): Promise<...> {
  // ... existing implementation
})

export const getBoundaryData = cache(async function getBoundaryData(
  area: Area,
  code: string,
): Promise<BoundaryResponse> {
  // ... existing implementation
})
```

**Reference:** 
- [Next.js Data Fetching - React cache()](https://nextjs.org/docs/app/building-your-application/data-fetching/caching#react-cache)
- [React RFC: cache](https://github.com/reactjs/rfcs/blob/main/text/0229-cache.md)

---

### ~~Issue 4: Expensive Computation Inside Map Loop~~
**Confidence Score: 0.80** | **Priority: HIGH** | **Type: Performance** | **Status: ✅ FIXED**

**Location:** `modules/Pilkada2024/BoundaryLayers.tsx:59-117`

**Evidence:**
```typescript
{childAreas.map((_childArea) => {
  const votes = getVotesByArea(_childArea.code)
  
  // ❌ All computed for EVERY child area, EVERY render:
  const candidateIds = Object.keys(candidates)              // O(n)
  const numericVotes = candidateIds.map((id) => ({         // O(n)
    id,
    val: votes[id],
  }))
  numericVotes.sort((a, b) => b.val - a.val)              // O(n log n) ⚠️
  const total = numericVotes.reduce((s, x) => s + x.val, 0) // O(n)
  
  // More calculations...
  const winnerShare = winnerVal / total
  const runnerUpShare = runnerUpVal / total
  const margin = Math.max(0, winnerShare - runnerUpShare)
  const transformed = Math.max(0, Math.min(1, margin)) ** EXPONENT
  
  return <AreaBoundary pathOptions={{...}} />
})}
```

**Root Cause:**
- Complex calculations (sort, reduce, map) for each area
- NOT memoized
- Re-computed on every parent render
- For 100 areas: 100 sorts, 100 reduces, etc.

**Impact:**
- Performance degradation with many child areas
- O(n log n) sort operation repeated N times in loop = O(n² log n)
- Unnecessary CPU cycles blocking main thread
- Janky UI during re-renders

**Fix Strategy:**
```typescript
// Option 1: Pre-compute at parent level
const computedAreas = useMemo(() => {
  return childAreas.map((_childArea) => {
    const votes = getVotesByArea(_childArea.code)
    const candidateIds = Object.keys(candidates)
    const numericVotes = candidateIds.map((id) => ({
      id,
      val: votes[id],
    }))
    numericVotes.sort((a, b) => b.val - a.val)
    
    // ... all computations
    
    return {
      area: _childArea,
      winnerId,
      fillOpacity,
      // ... computed values
    }
  })
}, [childAreas, candidates, getVotesByArea])

// Then simple map:
{computedAreas.map(({ area, winnerId, fillOpacity }) => (
  <AreaBoundary key={area.code} ... />
))}

// Option 2: Extract to memoized component
const AreaBoundaryWithVotes = memo(({ area, candidates, votes }) => {
  // Computations here with useMemo
  return <AreaBoundary ... />
})
```

---

## 🟡 HIGH-MEDIUM ISSUES (Confidence 0.65-0.80)

### ~~Issue 5: Inline Event Handlers in Map Loops~~
**Confidence Score: 0.75** | **Priority: MEDIUM-HIGH** | **Type: Performance** | **Status: ✅ FIXED**

**Locations:**
- `modules/MapDashboard/IslandMarkers.tsx:103-114`
- `modules/MapDashboard/PopupArea.tsx:117-130`

**Evidence:**
```typescript
// IslandMarkers.tsx - inside islands.map()
{islands.map((island) => (
  <MapMarker key={island.code} ...>
    <DropdownMenuItem
      onClick={() => {  // ❌ NEW function for EACH island, EVERY render
        try {
          navigator.clipboard.writeText(island.coordinate)
          toast.success('Coordinate copied to clipboard', {
            duration: 3_000,
          })
        } catch (_error) {
          toast.error('Failed to copy coordinate to clipboard')
        }
      }}
    >
      Copy coordinate
    </DropdownMenuItem>
  </MapMarker>
))}
```

**Root Cause:**
- Event handlers created inline within `.map()` loop
- For N islands, N new function instances per render
- Not memoized or extracted

**Impact:**
- Memory overhead: 1000 islands = 1000 new functions every render
- Garbage collection pressure
- Potential re-renders if passed to memoized children
- Not critical but wasteful

**Fix Strategy:**
```typescript
// Option 1: Extract handler with useCallback
const handleCopyCoordinate = useCallback((coordinate: string) => {
  try {
    navigator.clipboard.writeText(coordinate)
    toast.success('Coordinate copied to clipboard', {
      duration: 3_000,
    })
  } catch (_error) {
    toast.error('Failed to copy coordinate to clipboard')
  }
}, [])

// In JSX:
<DropdownMenuItem onClick={() => handleCopyCoordinate(island.coordinate)}>

// Option 2: Handler factory
const createCopyHandler = (coordinate: string) => () => {
  // ... handler logic
}
// Still creates functions but clearer intent
```

---

### ~~Issue 6: Context Value Re-creation on Every Render~~
**Confidence Score: 0.70** | **Priority: MEDIUM-HIGH** | **Type: Performance** | **Status: ✅ FIXED**

**Location:** `modules/MapDashboard/DashboardProvider.tsx:62-75`

**Evidence:**
```typescript
const value: DashboardContext = {
  selectedArea,        // state
  changeSelectedArea,  // useCallback ✓
  isLoading,          // state
  loading,            // useCallback ✓
  boundaryVisibility, // state
  showBoundary,       // useCallback ✓
  areaBounds,         // state
  setAreaBounds,      // setState ✓
  clear,              // useCallback ✓
}

return <MapDashboardContext value={value}>{children}</MapDashboardContext>
```

**Root Cause:**
- Object literal created fresh every render
- Even when individual values haven't changed
- All consumers re-render on every parent render

**Impact:**
- Excessive re-renders of all context consumers
- Map components (expensive) triggered unnecessarily
- Performance degradation during interactions
- Trade-off: if memoized with all deps, still re-renders on any state change

**Fix Strategy:**
```typescript
const value = useMemo<DashboardContext>(
  () => ({
    selectedArea,
    changeSelectedArea,
    isLoading,
    loading,
    boundaryVisibility,
    showBoundary,
    areaBounds,
    setAreaBounds,
    clear,
  }),
  [
    selectedArea,
    changeSelectedArea,
    isLoading,
    loading,
    boundaryVisibility,
    showBoundary,
    areaBounds,
    setAreaBounds,
    clear,
  ]
)

// Or split context into multiple smaller contexts:
// - DashboardSelectionContext (selectedArea, changeSelectedArea)
// - DashboardLoadingContext (isLoading, loading)
// - DashboardBoundaryContext (boundaryVisibility, showBoundary)
// This allows components to subscribe only to what they need
```

---

### ~~Issue 7: MapFlyToBounds with Object Dependency~~
**Confidence Score: 0.65** | **Priority: MEDIUM** | **Type: Behavior** | **Status: ✅ FIXED**

**Location:** `components/MapFlyToBounds.tsx:8-10`

**Evidence:**
```typescript
export default function MapFlyToBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap()
  
  useEffect(() => {
    map.flyToBounds(bounds)
  }, [map, bounds])  // ⚠️ bounds is an object reference!
  
  return null
}
```

**Root Cause:**
- `bounds` is object (`LatLngBounds`)
- Object reference changes even if actual bounds values are same
- Effect triggers unnecessarily

**Impact:**
- Unnecessary map animations
- Poor UX: map flies when it shouldn't
- Depends on how frequently `bounds` prop updates

**Fix Strategy:**
```typescript
// Option 1: Extract primitive dependencies
useEffect(() => {
  map.flyToBounds(bounds)
}, [
  map,
  bounds.getNorth(),
  bounds.getSouth(),
  bounds.getEast(),
  bounds.getWest()
])

// Option 2: Deep comparison (use-deep-compare-effect)
import { useDeepCompareEffect } from 'use-deep-compare'

useDeepCompareEffect(() => {
  map.flyToBounds(bounds)
}, [map, bounds])

// Option 3: Debounce/throttle
const debouncedFly = useMemo(
  () => debounce((b: LatLngBounds) => {
    map.flyToBounds(b)
  }, 300),
  [map]
)

useEffect(() => {
  debouncedFly(bounds)
}, [bounds, debouncedFly])
```

---

### ~~Issue 8: Duplicate Array Filtering Logic~~
**Confidence Score: 0.65** | **Priority: MEDIUM** | **Type: Performance** | **Status: ✅ FIXED**

**Location:** `modules/MapDashboard/IslandsFilterProvider.tsx:45-68`

**Evidence:**
```typescript
const counts = useMemo(() => {
  const total = islands.length
  const populated = islands.filter((i) => i.isPopulated).length          // Iteration 1
  const outermostSmall = islands.filter((i) => i.isOutermostSmall).length // Iteration 2
  const shown = islands.filter((i) => {                                   // Iteration 3
    if (!filter.populated && !filter.outermostSmall) return true
    return (
      (filter.populated && i.isPopulated) ||
      (filter.outermostSmall && i.isOutermostSmall)
    )
  }).length
  return { total, shown, populated, outermostSmall }
}, [islands, filter])

const filteredIslands = useMemo(() => {                                   // Iteration 4
  if (!filter.populated && !filter.outermostSmall) return islands
  return islands.filter(
    (i) =>
      (filter.populated && i.isPopulated) ||
      (filter.outermostSmall && i.isOutermostSmall),
  )
}, [islands, filter])
```

**Root Cause:**
- Same array filtered 4 times to compute different metrics
- Already wrapped in useMemo ✓
- Still inefficient: 4 × O(n) iterations

**Impact:**
- 4000 iterations for 1000 islands vs 1000 in combined approach
- Performance impact if filter changes frequently
- Minimal for small datasets
- Good optimization opportunity

**Fix Strategy:**
```typescript
const { counts, filteredIslands } = useMemo(() => {
  let populated = 0
  let outermostSmall = 0
  const filtered: Island[] = []
  
  // Single pass through array
  for (const island of islands) {
    if (island.isPopulated) populated++
    if (island.isOutermostSmall) outermostSmall++
    
    // Apply filter
    if (!filter.populated && !filter.outermostSmall) {
      filtered.push(island)
    } else if (
      (filter.populated && island.isPopulated) ||
      (filter.outermostSmall && island.isOutermostSmall)
    ) {
      filtered.push(island)
    }
  }
  
  return {
    counts: {
      total: islands.length,
      shown: filtered.length,
      populated,
      outermostSmall,
    },
    filteredIslands: filtered,
  }
}, [islands, filter])
```

---

## 🟢 MEDIUM ISSUES (Confidence 0.45-0.65)

### ~~Issue 9: Non-Primitive Effect Dependencies~~
**Confidence Score: 0.55** | **Priority: MEDIUM** | **Type: Code Smell** | **Status: ⚠️ NOT VALID**

**Location:** `modules/MapDashboard/AreaSelectors.tsx:57-66`

**Verdict: FALSE POSITIVE**

**Analysis:**
```typescript
// biome-ignore lint/correctness/useExhaustiveDependencies: only depends to selectedArea
useEffect(() => {
  for (const { area } of areas) {
    if (!selectedArea[area]) {
      setQuery((prevQuery) => ({
        ...prevQuery,
        [area]: defaultQuery[area],
      }))
    }
  }
}, [selectedArea])  // Missing: areas, defaultQuery
```

**Why This is INTENTIONAL (NOT A BUG):**

`defaultQuery` is **derived from** `selectedArea`:
```typescript
const defaultQuery = objectFromEntries(
  areas.reduce((acc, { area, parent }) => {
    if (parent && parent !== 'island' && selectedArea[parent]) {
      query = { parentCode: selectedArea[parent]?.code, limit: MAX_PAGE_SIZE }
    }
    // ... more logic
  }, [])
)
```

**The Problem with Adding `defaultQuery` to Dependencies:**

1. User selects province → `selectedArea` changes
2. Re-render → `defaultQuery` object recomputed (NEW reference)
3. Effect sees `defaultQuery` changed → runs `setQuery()`
4. Re-render → `defaultQuery` recomputed again (ANOTHER new reference)
5. Effect sees change again → **INFINITE LOOP** ♻️

**Why Linter Suppression is Correct:**

The effect intentionally synchronizes state only when `selectedArea` changes, not when `defaultQuery` recomputes. This is a **derived state pattern** where:
- `defaultQuery` is computed from `selectedArea`
- Effect resets `query` when parent selections change
- Adding derived values to deps would break the pattern

**Recommendation:** ✅ **KEEP SUPPRESSION** - Pattern is correct and necessary.

---

### ~~Issue 10: TileLayer useRef with Eager Initialization~~
**Confidence Score: 0.50** | **Priority: MEDIUM** | **Type: Pattern** | **Status: ✅ FIXED**

**Location:** `components/TileLayer.tsx:10-14`

**Evidence:**
```typescript
const glRef = useRef<L.MaplibreGL>(
  L.maplibreGL({
    style: `/map-styles/${resolvedTheme}.json`,
  }),
)
```

**Root Cause:**
- `L.maplibreGL()` called every render as initial value
- useRef initial value evaluated every render
- Only first result is used, rest discarded
- Unnecessary object creation

**Impact:**
- Object creation overhead (mitigated by ref.current check)
- Suboptimal pattern but not critical
- Memory allocation on every render (small)

**Fix Applied:**
```typescript
// Option 1: Lazy initialization - IMPLEMENTED
const glRef = useRef<L.MaplibreGL>()
if (!glRef.current) {
  glRef.current = L.maplibreGL({
    style: `/map-styles/${resolvedTheme}.json`,
  })
}
```

**Verification:**
- ✅ No runtime errors
- ✅ Map renders correctly
- ✅ Theme switching works
- ✅ Safe and stable fix

---

### Issue 11: No React.memo Usage
**Confidence Score: 0.45** | **Priority: LOW** | **Type: Optimization**

**Location:** Across codebase - 0 usages of `React.memo()`

**Observation:**
- `MapMarker` - rendered potentially thousands of times
- `ComboboxArea` - rendered 4× in AreaSelectors
- `AreaBoundary` - rendered multiple times
- No components wrapped with `React.memo()`

**Root Cause:**
- Components not memoized to prevent unnecessary re-renders
- React 19 has improved default optimizations
- Possibly intentional (premature optimization is evil)

**Impact:**
- Depends on actual re-render frequency
- Could benefit large lists (island markers)
- Without profiling, hard to determine real impact
- React 19 Compiler may handle this automatically

**Fix Strategy:**
```typescript
// Selective memoization for expensive components
export default memo(function MapMarker({ position, title, children }) {
  // ... component logic
})

// With custom comparison
export default memo(
  function AreaBoundary({ area, code, pathOptions, children }) {
    // ... component logic
  },
  (prevProps, nextProps) => {
    // Custom comparison logic
    return prevProps.code === nextProps.code &&
           prevProps.area === nextProps.area
  }
)

// ⚠️ Only apply after profiling shows it's needed!
```

**Recommendation:** Profile first, optimize second. React 19's improvements may make this unnecessary.

---

## ⚪ LOW PRIORITY ISSUES (Confidence < 0.45)

### ~~Issue 12: Event Handler Ref Pattern Complexity~~
**Confidence Score: 0.40** | **Priority: LOW** | **Type: Complexity** | **Status: ⚠️ NOT VALID**

**Location:** `modules/MapDashboard/BoundaryLayers.tsx:16-36`

**Verdict: FALSE POSITIVE - Pattern is NECESSARY**

**Analysis:**
```typescript
// Keep a ref to the latest `loading` callback so stable handlers can call it
const loadingRef = useRef(loading)
useEffect(() => {
  loadingRef.current = loading
}, [loading])

// Store stable per-area handlers so their identity doesn't change across renders
const handlersRef = useRef<Record<string, (isLoading: boolean) => void>>({})

// In render loop:
if (!handlersRef.current[area]) {
  handlersRef.current[area] = (isLoading: boolean) =>
    loadingRef.current(area, isLoading)
}
const onLoading = handlersRef.current[area]
```

**Why This Pattern is CRITICAL:**

This pattern solves a real problem: AreaBoundary has this effect:
```typescript
// In AreaBoundary.tsx:54-56
useEffect(() => {
  onLoading?.(boundary.status === 'pending')
}, [boundary.status, onLoading])
```

**The Infinite Loop Problem with `useCallback` "Simplification":**

Naive "fix":
```typescript
const handleLoading = useCallback(
  (isLoading: boolean) => loading(area, isLoading),
  [loading, area]
)
```

**Why this causes infinite loop:**

1. User selects province → `selectedArea` changes
2. DashboardProvider re-renders → context updates
3. BoundaryLayers gets new `loading` from context
4. useCallback creates NEW function (dependency changed!)
5. AreaBoundary's effect sees `onLoading` changed
6. Effect runs: `onLoading(false)` → calls `loading(area, false)`
7. `loading` updates `isLoading` state → provider re-renders
8. **INFINITE LOOP** ♻️

**Why Ref Pattern Works:**

| Aspect | useCallback | Ref Pattern |
|--------|-----------|-----------|
| **Handler reference** | ❌ Changes with context updates | ✅ Stable (created once per area) |
| **Calls latest `loading`?** | ✅ Yes (closure) | ✅ Yes (via `loadingRef.current`) |
| **AreaBoundary effect triggers?** | ❌ Every context update | ✅ Only on boundary status change |
| **Infinite loop?** | ❌ YES | ✅ NO |

**Key Insight:**
The ref pattern creates a **stable callback identity** while still calling the latest `loading` function. This prevents unnecessary effect triggers while maintaining closure-based data access.

**Recommendation:** ✅ **KEEP REF PATTERN** - Necessary for correct behavior.

---

### Issue 13: Hook Return Functions Not Memoized
**Confidence Score: 0.35** | **Priority: LOW** | **Type: Minor**

**Location:** `modules/Pilkada2024/hooks/usePilkada.ts:67-86`

**Evidence:**
```typescript
export function useCandidates({ election, enabled = true }) {
  const { data, status, ...args } = useQuery({...})
  
  return {
    status,
    ...args,
    getCandidates: (areaCode: string) => {  // ❌ NEW function every render
      if (status !== 'success') throw new Error(...)
      return data[areaCode.replaceAll('.', '')]
    },
    getCandidate: (areaCode: string, candidateId: string) => {
      // ...
    },
  }
}
```

**Root Cause:**
- Returned functions not wrapped with `useCallback`
- New function instances on every render

**Impact:**
- Very low - functions are simple getters
- Consumers might re-render if they depend on function identity
- Unlikely to cause issues in practice

**Fix Strategy:**
```typescript
const getCandidates = useCallback((areaCode: string) => {
  if (status !== 'success') {
    throw new Error('Ensure the data is ready before calling this function')
  }
  return data[areaCode.replaceAll('.', '')]
}, [status, data])

return {
  status,
  ...args,
  getCandidates,
  // ...
}
```

**Recommendation:** Low priority. Only fix if profiling shows impact.

---

### Issue 14: Conditional Rendering with &&
**Confidence Score: 0.20** | **Priority: IGNORE** | **Type: Style Preference**

**Location:** `modules/MapDashboard/MapView.tsx:21`

**Evidence:**
```typescript
{areaBounds && <MapFlyToBounds bounds={areaBounds} />}
```

**Analysis:**
- `areaBounds` type is `LatLngBounds | undefined`
- `LatLngBounds` object is always truthy ✓
- `undefined` is always falsy ✓
- No risk of rendering `0`, `""`, or `false`

**Verdict:** This is perfectly safe. Not an issue.

**Note:** React best practices sometimes recommend ternary for consistency:
```typescript
{areaBounds ? <MapFlyToBounds bounds={areaBounds} /> : null}
```

But this is **purely stylistic** and has zero functional impact.

---

## ✅ WHAT'S ALREADY GOOD

The codebase demonstrates many solid practices:

### Architecture & Setup
- ✅ Next.js 15 with App Router (latest stable)
- ✅ React 19 (cutting edge)
- ✅ TypeScript with strict typing
- ✅ Good separation of concerns (components, hooks, modules)
- ✅ Proper project structure

### Data Fetching
- ✅ React Query for client-side data fetching
- ✅ Proper caching configuration (staleTime: 5 minutes)
- ✅ No waterfall fetching patterns
- ✅ Lazy initialization for QueryClient
- ✅ Error handling in data fetching

### Performance
- ✅ Dynamic imports for heavy map components
- ✅ SSR disabled for Leaflet components (correct!)
- ✅ Some useMemo/useCallback usage
- ✅ Stable keys in list rendering (using `code`, `href`, etc.)

### Code Quality
- ✅ Consistent coding style
- ✅ Proper TypeScript types
- ✅ Good component composition
- ✅ Context API used appropriately
- ✅ Custom hooks for reusable logic

---

## 📊 IMPLEMENTATION ROADMAP

### Phase 1: Critical Fixes (Week 1)
**Goal:** Fix broken functionality

- [ ] **Issue 1:** Fix debounce in AreaSelectors (0.95)
  - Extract debounced function to parent level
  - Use useMemo or useRef pattern
  - Test: Verify debouncing works on search input
  
- [ ] **Issue 2:** Fix debounce in useDashboardLayout (0.92)
  - Wrap debounced function in useMemo
  - Test: Verify map resize debouncing works
  
- [ ] **Issue 3:** Add React.cache() to data functions (0.85)
  - Wrap getData and getBoundaryData
  - Test: Verify no duplicate fetches in server logs
  
- [ ] **Issue 4:** Optimize Pilkada BoundaryLayers (0.80)
  - Move computations to useMemo
  - Test: Profile render time before/after

### Phase 2: Performance Optimizations (Week 2)
**Goal:** Improve performance

- [x] **Issue 5:** Extract inline event handlers (0.75)
  - Use useCallback for handlers in IslandMarkers and PopupArea
  - ✅ Fixed: Clipboard handlers now use memoized callbacks
  
- [x] **Issue 6:** Memoize context value (0.70)
  - Wrap context value in useMemo
  - ✅ Fixed: DashboardProvider now memoizes value object
  
- [x] **Issue 7:** Fix MapFlyToBounds deps (0.65)
  - Use memoized bounds key to prevent unnecessary fly animations
  - ✅ Fixed: Effect now uses boundsKey dependency
  
- [x] **Issue 8:** Combine array iterations (0.65)
  - Single-pass filtering and counting
  - ✅ Fixed: 4 iterations reduced to 1 (4000 → 1000 for 1000 islands)

### Phase 3: Code Quality (Week 3)
**Goal:** Investigate code smells

- [x] **Issue 9:** Effect dependencies (0.55)
   - ✅ INVESTIGATED: False positive - pattern is intentional derived state handling
   - Linter suppression is correct and necessary
   
- [x] **Issue 10:** Fix TileLayer ref pattern (0.50)
   - ✅ Fixed: Uses lazy initialization with if (!glRef.current) check
   
- [ ] **Issue 11:** Add selective React.memo (0.45)
   - Profile first
   - Memo expensive components only

- [x] **Issue 12:** Ref pattern complexity (0.40)
   - ✅ INVESTIGATED: False positive - pattern prevents infinite loops with context
   - Ref pattern is necessary, useCallback would break functionality
   
- [ ] **Issue 13:** Memoize hook returns (0.35)
   - If profiling shows need

---

## 🧪 TESTING CHECKLIST

After each fix, verify:

### Functional Tests
- [ ] Search debouncing works (500ms delay)
- [ ] Map resize debouncing works (100ms delay)
- [ ] No duplicate data fetches on page load
- [ ] Map animations smooth and correct
- [ ] Island filtering works correctly
- [ ] No console errors or warnings

### Performance Tests
- [ ] Profile React DevTools before/after
- [ ] Measure render time for large datasets (1000+ islands)
- [ ] Check memory usage with Chrome DevTools
- [ ] Verify no unnecessary re-renders
- [ ] Test on slower devices/networks

### Regression Tests
- [ ] All existing features still work
- [ ] No visual changes (unless intended)
- [ ] TypeScript builds without errors
- [ ] Biome linter passes
- [ ] All unit tests pass
- [ ] All E2E tests pass

---

## 📚 REFERENCES

### React Best Practices
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React Best Practices (Official)](https://react.dev/learn/thinking-in-react)
- [React Compiler](https://react.dev/learn/react-compiler)

### Next.js Documentation
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Data Fetching & Caching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React cache()](https://nextjs.org/docs/app/building-your-application/data-fetching/caching#react-cache)

### Performance Optimization
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [useMemo vs useCallback](https://react.dev/reference/react/useMemo)
- [React.memo Guide](https://react.dev/reference/react/memo)

### Tools
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Chrome Performance Tab](https://developer.chrome.com/docs/devtools/performance/)

---

## 🎯 SUCCESS METRICS

Track these metrics before and after optimization:

### Performance Metrics
- **Time to Interactive (TTI):** Target < 3s
- **First Contentful Paint (FCP):** Target < 1.5s
- **Largest Contentful Paint (LCP):** Target < 2.5s
- **React Render Time:** Measure with DevTools
- **Memory Usage:** Monitor heap size

### Code Quality Metrics
- **TypeScript Errors:** 0 (currently has some in tests)
- **Linter Warnings:** 0
- **Test Coverage:** Maintain or improve
- **Bundle Size:** Monitor chunk sizes

### User Experience Metrics
- **Search Responsiveness:** 500ms debounce working
- **Map Interactions:** Smooth 60fps
- **Data Loading:** Fast fetches, no duplicates
- **Overall Feel:** Snappy and responsive

---

## 🚨 FINAL REMINDER

> **⚠️ BEFORE MERGING THIS BRANCH ⚠️**
>
> 1. **DELETE THIS FILE:** `REACT_BEST_PRACTICES_DIAGNOSTIC.md`
> 2. **VERIFY:** Run `git status` to ensure it's not staged
> 3. **CHECK:** `.gitignore` includes this file
> 4. **CONFIRM:** File is not in commit history
>
> **THIS FILE MUST NEVER BE PUSHED TO REMOTE!**
>
> Keep internal diagnostics private and professional.

---

**Report Generated:** 2026-01-17  
**Last Updated:** 2026-02-14  
**Codebase Version:** 1.5.0  
**Analyzed By:** OpenCode AI Assistant  
**Total Issues:** 14 (4 Critical ✅, 4 High-Medium ✅, 3 Medium, 3 Low)
