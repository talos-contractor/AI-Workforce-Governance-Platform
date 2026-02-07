---
name: chrome-devtools-debugging
description: Browser debugging and analysis using Chrome DevTools patterns. Use when diagnosing frontend issues, analyzing network requests, debugging JavaScript, inspecting DOM elements, checking performance bottlenecks, or validating API responses in web applications. Includes console debugging techniques, network analysis, and React/Vite-specific debugging workflows.
---

# Chrome DevTools Debugging

## Overview

Chrome DevTools provides comprehensive debugging capabilities for web applications. Use these patterns to diagnose issues without needing direct browser access.

## Common Debugging Scenarios

### 1. JavaScript Errors

**Symptoms:**
- White screen / blank page
- Buttons not working
- Data not loading

**Diagnostic Steps:**
```javascript
// Add to browser console or source code temporarily
console.log('DEBUG: Component mounted', { props, state })
console.error('DEBUG: Error occurred', error)
console.table(arrayData)

// Check if Supabase client initialized
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase client:', supabase)
```

**Common Fixes:**
- Check `.env` variables are loaded (VITE_ prefix required)
- Verify API keys are valid
- Check for CORS errors in Network tab
- Look for 401/403 auth errors

### 2. Network Request Issues

**Check these in DevTools Network Tab:**

| Check | What to Look For |
|-------|------------------|
| Status Code | 200=OK, 401=Auth, 403=Forbidden, 404=Not Found |
| Response Body | Is data returned? JSON structure correct? |
| Headers | Content-Type: application/json? |
| Timing | Slow requests? Timeout errors? |

**Debugging Supabase API:**
```javascript
// Add to your API call to see details
const { data, error } = await getAssistants()
console.log('API Response:', { data, error })

// Check if error has details
if (error) {
  console.error('Error code:', error.code)
  console.error('Error message:', error.message)
  console.error('Error details:', error.details)
}
```

### 3. React Component Issues

**React DevTools patterns:**
```javascript
// Check component props
console.log('Props:', props)

// Check state changes
useEffect(() => {
  console.log('State changed:', state)
}, [state])

// Check if effect runs
useEffect(() => {
  console.log('Component mounted')
  return () => console.log('Component unmounted')
}, [])
```

### 4. Vite Environment Variables

**Common issue:** Variables not loading

**Check in DevTools Console:**
```javascript
// Should show your Supabase URL
console.log(import.meta.env.VITE_SUPABASE_URL)

// Wrong (won't work in browser)
console.log(process.env.VITE_SUPABASE_URL)  // ❌
```

**Fix:** Ensure `.env` is in `apps/web/` and variables start with `VITE_`

### 5. Modal/Popup Not Opening

**Diagnostic:**
```javascript
// Check if state is changing
const [isOpen, setIsOpen] = useState(false)

const openModal = () => {
  console.log('Opening modal...')  // Should print
  setIsOpen(true)
  console.log('isOpen set to:', true)  // Check state
}

// In render:
console.log('Render - isOpen:', isOpen)  // Should be true after click
```

**Common causes:**
- Event handler not attached
- State not updating
- CSS z-index blocking clicks
- `e.preventDefault()` stopping form submission

### 6. Database Connection Issues

**Check these layers:**

1. **Environment variables loaded?**
   ```javascript
   console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
   ```

2. **Client initialized?**
   ```javascript
   console.log('Supabase client:', supabase)
   ```

3. **Query executing?**
   ```javascript
   const { data, error } = await supabase.from('assistants').select('*')
   console.log('Query result:', { data, error })
   ```

4. **RLS blocking access?**
   - Check Supabase Table Editor for RLS errors
   - Verify `set_tenant_context` is called before queries

## Console Debugging Commands

```javascript
// Clear console
console.clear()

// Group logs
console.group('Assistant Creation')
console.log('Form data:', formData)
console.log('API result:', result)
console.groupEnd()

// Time operations
console.time('loadAssistants')
await loadAssistants()
console.timeEnd('loadAssistants')  // Shows execution time

// Trace function calls
console.trace('Function called from:')

// View all elements with class
console.log(document.querySelectorAll('.modal'))

// Check computed styles
getComputedStyle(element).display

// Force re-render (React)
element._reactInternals?.return?.stateNode?.forceUpdate?.()
```

## Network Tab Analysis

**What to check when API fails:**

1. **Filter by XHR/Fetch** - See only API calls
2. **Check request headers** - Authorization token present?
3. **Check request payload** - Data sent correctly?
4. **Check response** - Error message from server?
5. **Check timing** - Request taking too long?

**Copy as cURL:**
Right-click request → Copy → Copy as cURL (useful for testing outside browser)

## Elements Tab Inspection

**Finding elements:**
```javascript
// In console, find elements
$$('button')  // All buttons
$0            // Currently selected element in Elements tab
$_            // Previous selected element

// Check if element exists
document.querySelector('.modal') !== null

// Check visibility
document.querySelector('.modal').offsetParent !== null
```

## Performance Issues

**Identify slow renders:**
```javascript
// Add to component
useEffect(() => {
  performance.mark('component-start')
  return () => {
    performance.mark('component-end')
    performance.measure('component', 'component-start', 'component-end')
    console.log('Render time:', performance.getEntriesByName('component')[0].duration)
  }
})
```

## Application Tab

**Check localStorage/sessionStorage:**
```javascript
// View all stored data
localStorage

// Check specific key
localStorage.getItem('awgp-theme')

// Clear if needed
localStorage.clear()
```

## React DevTools Specific

**Components tab:**
- See component hierarchy
- Inspect props and state
- Identify re-renders

**Profiler tab:**
- Record performance
- See which components render slowly
- Identify unnecessary re-renders

## Quick Diagnostic Checklist

| Issue | Check |
|-------|-------|
| Page blank | Console for errors, check if JS loads |
| Buttons not working | Event handlers attached? State updating? |
| API not returning data | Network tab, check 401/403 errors |
| Data not displaying | Check component receives props correctly |
| Modal not opening | State value, z-index, click handlers |
| Styling wrong | Check CSS classes, dark mode class |
| Slow performance | React Profiler, unnecessary re-renders |

## Debugging AWGP Specifically

### Create Assistant Modal Not Working

1. **Check button click:**
   ```javascript
   // Add to button onClick
   console.log('Create Assistant clicked')
   ```

2. **Check state change:**
   ```javascript
   // In component
   const [isModalOpen, setIsModalOpen] = useState(false)
   console.log('isModalOpen:', isModalOpen)
   ```

3. **Check if Modal component renders:**
   ```javascript
   // In Modal component
   console.log('Modal render - isOpen:', isOpen)
   ```

4. **Check for CSS blocking:**
   ```javascript
   // Check z-index
   getComputedStyle(document.querySelector('.modal')).zIndex
   ```

### Supabase Query Not Working

1. **Check env vars loaded:**
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL)
   ```

2. **Check client exists:**
   ```javascript
   console.log(supabase)
   ```

3. **Check query executes:**
   ```javascript
   const result = await supabase.from('assistants').select('*')
   console.log(result)
   ```

4. **Check RLS context:**
   ```javascript
   await supabase.rpc('set_tenant_context', { tenant_id: 'xxx' })
   ```

See [references/debugging-patterns.md](references/debugging-patterns.md) for advanced patterns.
See [scripts/diagnostic-checklist.sh](scripts/diagnostic-checklist.sh) for automated diagnostics.
