export const queryKeys = {
  health: {
    all: ['health'] as const,
    dailyLog: (date?: string) => ['health', 'daily-log', date] as const,
    foods: () => ['health', 'foods'] as const,
    activities: () => ['health', 'activities'] as const,
    voices: () => ['health', 'voices'] as const,
    fasting: () => ['health', 'fasting'] as const,
    fastingHistory: () => ['health', 'fasting', 'history'] as const,
    bloodTests: () => ['health', 'blood-tests'] as const,
    documents: () => ['health', 'documents'] as const,
    medicalPhotos: () => ['health', 'medical-photos'] as const,
    goals: () => ['health', 'goals'] as const,
    achievements: () => ['health', 'achievements'] as const,
    userAchievements: () => ['health', 'user-achievements'] as const,
    streaks: () => ['health', 'streaks'] as const,
    weeklyLogs: () => ['health', 'weekly-logs'] as const,
  },
  chat: {
    all: ['chat'] as const,
    conversations: () => ['chat', 'conversations'] as const,
    conversation: (id: string) => ['chat', 'conversations', id] as const,
    messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
    healthProfile: () => ['chat', 'health-profile'] as const,
  },
  supplements: {
    all: ['supplements'] as const,
    list: (category?: string) => ['supplements', 'list', category] as const,
    detail: (id: string) => ['supplements', 'detail', id] as const,
    recommendations: () => ['supplements', 'recommendations'] as const,
    orders: () => ['supplements', 'orders'] as const,
  },
  community: {
    all: ['community'] as const,
    posts: (category?: string) => ['community', 'posts', category] as const,
    post: (id: string) => ['community', 'post', id] as const,
  },
  family: {
    all: ['family'] as const,
    members: () => ['family', 'members'] as const,
    medications: (memberId: string) => ['family', 'medications', memberId] as const,
    adherence: (memberId: string) => ['family', 'adherence', memberId] as const,
  },
  wearable: {
    all: ['wearable'] as const,
    devices: () => ['wearable', 'devices'] as const,
    userDevices: () => ['wearable', 'user-devices'] as const,
    data: (deviceId?: string) => ['wearable', 'data', deviceId] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => ['user', 'profile'] as const,
  },
} as const;

export const staleTime = {
  static: 5 * 60 * 1000,
  dynamic: 30 * 1000,
  realtime: 10 * 1000,
} as const;
