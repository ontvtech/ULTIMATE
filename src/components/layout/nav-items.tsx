/**
 * Navigation Items - Re-exports from nav-config.tsx
 * 
 * This file is kept for backwards compatibility.
 * All navigation configuration is now in nav-config.tsx
 * 
 * @deprecated Import from './nav-config' instead
 */

export {
  type NavItem,
  type NavGroup,
  adminNavItems,
  revendedorNavItems,
  lojistaNavItems,
  getNavItemsByRole,
  filterNavItemsByPermissions,
  findNavItemByHref,
  getParentNavGroup,
  getBreadcrumbPath,
} from './nav-config'
