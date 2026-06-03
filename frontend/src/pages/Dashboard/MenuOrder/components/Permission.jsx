import React from 'react';
import './Permission.css';

/**
 * Permission component – applies a visual style according to the user group.
 *
 * Props:
 *   - group: string – identifies the permission group (e.g. "admin", "manager", "staff", "guest").
 *   - children: ReactNode – the UI to be wrapped.
 *
 * The component maps the supplied group to a CSS class defined in Permission.css.
 * If the group is not recognised, a neutral default style is applied.
 */
export default function Permission({ group, children }) {
  // Normalise the group name to lower‑case for flexible matching.
  const normalized = (group || '').toLowerCase();

  // Determine the CSS class based on the group.
  const className = (() => {
    switch (normalized) {
      case 'admin':
        return 'permission-admin';
      case 'manager':
        return 'permission-manager';
      case 'staff':
        return 'permission-staff';
      case 'guest':
        return 'permission-guest';
      default:
        return 'permission-default';
    }
  })();

  return <div className={className}>{children}</div>;
}
