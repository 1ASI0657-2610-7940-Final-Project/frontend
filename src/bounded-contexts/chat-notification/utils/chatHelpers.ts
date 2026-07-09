import type { ConversationParticipant } from '@chat/types/chat.types'

export interface ParticipantMeta {
  role: string
  online: boolean
  avatar: string | null
  initials: string
}

export const getConversationCounterpart = (
  participants: ConversationParticipant[] | undefined,
  currentUserId?: string | null
): ConversationParticipant | undefined => {
  if (!participants?.length) return undefined
  if (!currentUserId) return participants[0]
  return participants.find((participant) => participant.id !== currentUserId) || participants[0]
}

export const getParticipantMeta = (name: string): ParticipantMeta => {
  return {
    role: 'Participant',
    online: false,
    avatar: null,
    initials: name.slice(0, 2).toUpperCase()
  }
}
