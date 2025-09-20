export type UserRole = 'citizen' | 'official' | 'analyst';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export const ROLES: Record<UserRole, string> = {
  citizen: 'Citizen',
  official: 'Official',
  analyst: 'Analyst'
};

export const getRolePermissions = (role: UserRole) => {
  const permissions = {
    citizen: [
      'view_alerts',
      'view_shelters',
      'view_weather',
      'report_incidents',
      'view_evacuation_routes'
    ],
    official: [
      'view_alerts',
      'view_shelters',
      'view_weather',
      'moderate_incidents',
      'manage_resources',
      'assign_tasks',
      'send_alerts',
      'view_analytics'
    ],
    analyst: [
      'view_alerts',
      'view_analytics',
      'view_trends',
      'view_predictive',
      'export_reports',
      'filter_data'
    ]
  };
  
  return permissions[role] || [];
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions.includes(permission);
};

export const getDashboardPath = (role: UserRole): string => {
  return `/dashboard/${role}`;
};

export const isValidRole = (role: string): role is UserRole => {
  return ['citizen', 'official', 'analyst'].includes(role);
};


