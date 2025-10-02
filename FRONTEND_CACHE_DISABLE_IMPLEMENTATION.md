# Frontend Cache Disable Implementation

## Summary
Added `disableCache` parameter to all frontend AI search calls to bypass stale cache and always fetch fresh results during development/testing.

## Changes Made

### 1. Search Service (`searchService.ts`)

#### Updated Method Signature:
```typescript
async searchCandidatesDirectAI(
  searchText: string, 
  contextualHints?: any, 
  pagination?: PaginationOptions, 
  disableCache?: boolean  // NEW PARAMETER
): Promise<SearchResponse>
```

#### Implementation Details:
- **Default Behavior**: Cache is disabled by default (`disableCache !== false`)
- **Query Parameter**: Appends `?disableCache=true` to API URL when enabled
- **Logging**: Added console log to show cache status

#### Code:
```typescript
// Add disableCache parameter (default to true during development/testing)
if (disableCache !== false) {
  queryParams.append('disableCache', 'true');
}

console.log('🔧 Cache disabled:', disableCache !== false);
```

#### Export Function Updated:
```typescript
export const searchCandidatesDirectAI = (
  searchText: string, 
  contextualHints?: any, 
  pagination?: PaginationOptions, 
  disableCache?: boolean
) => searchService.searchCandidatesDirectAI(searchText, contextualHints, pagination, disableCache);
```

### 2. Component Updates

All three search components now pass `disableCache: true` by default:

#### GlobalSearchComponent (`GlobalSearchComponent.tsx`)
```typescript
searchResults = await searchCandidatesDirectAI(searchQuery, {
  urgency: 'medium',
  flexibility: 'moderate', 
  primaryFocus: 'balanced',
  isLocationAgnostic: false,
  balanceMode: 'recall_optimized'
}, { page: 1, limit: 3 }, true); // disableCache: true for fresh results
```

#### QuickSearch Component (`QuickSearch.tsx`)
```typescript
searchResults = await searchCandidatesDirectAI(searchQuery, {
  urgency: 'high',
  flexibility: 'moderate', 
  primaryFocus: 'balanced',
  isLocationAgnostic: false,
  balanceMode: 'recall_optimized'
}, { page: 1, limit: 10 }, true); // disableCache: true for fresh results
```

#### CompactSearchComponent (`CompactSearchComponent.tsx`)
```typescript
searchResults = await searchCandidatesDirectAI(searchQuery, {
  urgency: 'medium',
  flexibility: 'moderate', 
  primaryFocus: 'balanced',
  isLocationAgnostic: false,
  balanceMode: 'recall_optimized'
}, { page: 1, limit: 3 }, true); // disableCache: true for fresh results
```

## API Request Example

### Before (Cached):
```
POST http://localhost:3000/api/v1/search/candidates/external-ai-direct?page=1&limit=3
```

### After (Cache Disabled):
```
POST http://localhost:3000/api/v1/search/candidates/external-ai-direct?page=1&limit=3&disableCache=true
```

## Benefits

### 1. **Development/Testing**
- ✅ Always get fresh results after code changes
- ✅ No need to manually clear database cache
- ✅ Easier debugging of AI query generation changes

### 2. **Production Ready**
- ✅ Can enable caching by passing `disableCache: false`
- ✅ Default behavior protects against stale cache during testing
- ✅ Easy to toggle cache per request

### 3. **Flexibility**
- ✅ Per-request cache control
- ✅ No need to restart backend
- ✅ No need to run SQL scripts

## Usage Patterns

### Disable Cache (Default for Development):
```typescript
await searchCandidatesDirectAI(query, hints, pagination, true);
// or
await searchCandidatesDirectAI(query, hints, pagination); // defaults to disabled
```

### Enable Cache (Production):
```typescript
await searchCandidatesDirectAI(query, hints, pagination, false);
```

## Testing Instructions

### 1. Test with Cache Disabled
1. Search for: **"react developer with banking experience"**
2. Check network request includes `?disableCache=true`
3. Verify fresh results returned
4. Check console log: `🔧 Cache disabled: true`

### 2. Verify Filter Conversion
Expected log output:
```javascript
✅ Direct AI search - Converted query to filters: {
  jobTitle: ['developer', 'react', ...],
  skills: ['react'],
  companyIndustry: ['banking'],  // ✅ Should be companyIndustry
  isWorking: true
}
```

### 3. Verify Results
- Results count > 0
- Candidates have React skills
- Candidates have banking industry experience

## Files Modified

1. **Service Layer:**
   - `frontend/src/services/searchService.ts`
     - Added `disableCache` parameter to method
     - Added query parameter appending
     - Updated export function
     - Added cache status logging

2. **UI Components:**
   - `frontend/src/components/GlobalSearchComponent.tsx`
   - `frontend/src/components/QuickSearch.tsx`
   - `frontend/src/components/CompactSearchComponent.tsx`
   - All now pass `disableCache: true` by default

## Related Backend Changes

This frontend change works with the backend `disableCache` parameter support added in:
- `backend/src/modules/search/search.controller.ts`
- `backend/src/modules/search/search.service.ts`
- `backend/src/modules/search/services/coresignal-search.service.ts`

See `CORESIGNAL_CACHE_DISABLE_GUIDE.md` for backend implementation details.

## Production Considerations

### Current Setup (Development):
- Cache disabled by default for all searches
- Ensures fresh results during testing
- Useful when iterating on AI query logic

### Future Production Setup:
- Change default to `false` (enable caching)
- Only disable cache for specific use cases:
  - Admin debug mode
  - Real-time searches
  - Forced refresh requests

### Toggle Production Mode:
```typescript
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// In components:
await searchCandidatesDirectAI(
  query, 
  hints, 
  pagination, 
  !IS_PRODUCTION  // Cache disabled in dev, enabled in prod
);
```

## Cache Status Visibility

Console logs now show cache status:
```
🚀 Direct AI search payload: {...}
🔧 Cache disabled: true
🎯 Direct AI search response (single call): {...}
```

## Success Criteria

✅ All search components pass `disableCache: true`  
✅ API requests include `?disableCache=true` parameter  
✅ Backend receives and respects cache disable flag  
✅ Fresh results returned on every search  
✅ No TypeScript errors  
✅ Console logs show cache status
