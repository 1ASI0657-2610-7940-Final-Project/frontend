export interface ParticipantMeta {
  role: string
  online: boolean
  avatar: string | null
  initials: string
}

export const getParticipantMeta = (name: string): ParticipantMeta => {
  const metadata: Record<string, { role: string; online: boolean; avatar: string | null; initials?: string }> = {
    'Sarah Jenkins': {
      role: 'Product Manager at startupX',
      online: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    'Mark Davis': {
      role: 'Client',
      online: false,
      avatar: null,
      initials: 'M'
    },
    'Alex Chen - TechNova': {
      role: 'Client',
      online: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    'Emily Wong': {
      role: 'Client',
      online: false,
      avatar: null,
      initials: 'E'
    }
  }

  const match = metadata[name]
  if (match) {
    return {
      role: match.role,
      online: match.online,
      avatar: match.avatar,
      initials: match.initials || name.slice(0, 1).toUpperCase()
    }
  }

  return {
    role: 'Client',
    online: false,
    avatar: null,
    initials: name.slice(0, 2).toUpperCase()
  }
}
