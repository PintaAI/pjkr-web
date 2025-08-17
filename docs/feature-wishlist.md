# Feature Wishlist

This document tracks upcoming features and UI components that we'd like to implement in the future.

## UI Components

### Floating Dock Component

**Status:** Wishlist  
**Priority:** Medium  
**Source:** [Aceternity UI - Floating Dock](https://ui.aceternity.com/components/floating-dock)

A macOS-style floating dock component that acts as a navigation bar with smooth animations and hover effects.

#### Description
- Responsive design with separate desktop and mobile implementations
- Desktop version features a magnification effect on hover
- Mobile version has a collapsible menu with animated items
- Supports custom icons and navigation links

#### Technical Details
- **Dependencies:** 
  - `motion` (Framer Motion)
  - `clsx` 
  - `tailwind-merge`
  - `@tabler/icons-react`
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS

#### Current Considerations
Since we already have a sidebar navigation system, implementing this component would require careful consideration of:

1. **Role Differentiation:**
   - Sidebar for primary/global navigation
   - Floating dock for contextual actions or secondary navigation
   
2. **Mobile Strategy:**
   - Could replace existing mobile navigation
   - Provides modern, app-like experience
   
3. **Use Cases:**
   - Quick access toolbar for frequently used actions
   - Page-specific tools and actions
   - Theme toggles, search, notifications

#### Implementation Notes
- Component would be placed in [`components/ui/floating-dock.tsx`](components/ui/floating-dock.tsx)
- Utility functions needed in [`lib/utils.ts`](lib/utils.ts)
- Consider integration with existing navigation structure

#### Related Files
- [`components/sidebar/sidebar-nav.tsx`](components/sidebar/sidebar-nav.tsx) - Current navigation
- [`components/sidebar/app-sidebar.tsx`](components/sidebar/app-sidebar.tsx) - Main sidebar component

---

## Future Considerations

When we decide to implement this feature, we should:

1. Audit current navigation patterns
2. Define clear use cases for both sidebar and floating dock
3. Ensure consistent user experience across devices
4. Test accessibility and mobile responsiveness
5. Consider performance impact of animations

---

*Last updated: 2025-08-13*