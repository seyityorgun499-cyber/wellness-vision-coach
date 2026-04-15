export const ROUTES = {
  AUTH: '/auth',
  ONBOARDING: '/onboarding',
  HOME: '/',
  LOG: '/log',
  BOOST: '/boost',
  ANALYSIS: '/analysis',
  CAMERA: '/camera',
  VOICE: '/voice',
  DOCS: '/docs',
  ACTIVITY: '/activity',

  FASTING: '/fasting',
  ANALYTICS: '/analytics',
  WIDGETS: '/widgets',
  WEARABLES: '/wearables',
  WEARABLE_DATA: '/wearable-data',
  CHAT: '/chat',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  COMMUNITY: '/community',
  FAMILY: '/family',
  SUPPLEMENTS: '/supplements',
  BLOODTEST: '/bloodtest',
  HEALTH_PROFILE: '/health-profile',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
