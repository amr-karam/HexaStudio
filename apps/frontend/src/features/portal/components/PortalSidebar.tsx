const PORTAL_NAV_SECTIONS: PortalNavSection[] = [
  {
    marker: 'Overview',
    items: [
      { label: 'Dashboard', href: '/portal', icon: 'layout-dashboard' },
      { label: 'Projects', href: '/portal/projects', icon: 'folder-kanban' },
      { label: '3D Live Review', href: '/portal/review', icon: 'box' },
    ],
  },
  {
    marker: 'Workspace',
    items: [
      { label: 'Approvals', href: '/portal/approvals', icon: 'check-circle' },
      { label: 'Documents', href: '/portal/documents', icon: 'file-text' },
      { label: 'Finance', href: '/portal/finance', icon: 'receipt' },
      { label: 'AI Studio', href: '/portal/ai', icon: 'sparkles' },
      { label: 'Design System', href: '/design-system', icon: 'palette' },
    ],
  },
  {
    marker: 'System',
    items: [
      { label: 'Support', href: '/portal/support', icon: 'help-circle' },
      { label: 'Analytics', href: '/portal/analytics', icon: 'bar-chart' },
      { label: 'Settings', href: '/portal/settings', icon: 'settings' },
    ],
  },
];