import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

const TAB_ROUTES: Record<string, string> = {
  home: '/',
  log: '/log',
  analysis: '/analysis',
  camera: '/camera',
  voice: '/voice',
  docs: '/docs',
  activity: '/activity',

  fasting: '/fasting',
  analytics: '/analytics',
  widgets: '/widgets',
  wearables: '/wearables',
  'wearable-data': '/wearable-data',
  chat: '/chat',
  boost: '/boost',
  notifications: '/notifications',
  profile: '/profile',
  community: '/community',
  family: '/family',
  supplements: '/supplements',
  bloodtest: '/bloodtest',
  'health-profile': '/health-profile',
};

const ROUTE_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tab, route]) => [route, tab])
);

export function useTabNavigate() {
  const navigate = useNavigate();

  const tabNavigate = useCallback(
    (tab: string) => {
      const route = TAB_ROUTES[tab];
      if (route) {
        navigate(route);
      } else {
        console.warn(`Unknown tab: ${tab}`);
        navigate('/');
      }
    },
    [navigate]
  );

  return tabNavigate;
}

export function useActiveTab(): string {
  const location = useLocation();
  return ROUTE_TO_TAB[location.pathname] ?? 'home';
}
