<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingState from '../../../shared/components/LoadingState.vue'
import ErrorState from '../../../shared/components/ErrorState.vue'
import { useNotificationStore } from '@chat/stores/notificationStore'

interface NotificationItem {
  id: string
  group: string
  type: string
  title: string
  description: string
  time: string
  read: boolean
  actionType: string
  actionLabel?: string
  avatar?: string
}

const store = useNotificationStore()
const router = useRouter()

// Mock notifications representing the exact list in the user screenshot
const mockNotifications = ref<NotificationItem[]>([
  {
    id: 'mock-1',
    group: 'TODAY',
    type: 'OFFER',
    title: 'New Gig Offer: Frontend Refactor',
    description: 'TechCorp Inc. has sent you a direct offer for their upcoming dashboard refactoring project based on your recent portfolio update.',
    time: '10m ago',
    read: false,
    actionType: 'PRIMARY',
    actionLabel: 'View Offer'
  },
  {
    id: 'mock-2',
    group: 'TODAY',
    type: 'MESSAGE',
    title: 'Sarah Jenkins sent a message',
    description: '"Hi there! I reviewed the latest wireframes for the mobile app navigation. Could we schedule a quick 15-minute sync this afternoon to discuss some minor adjustments to the active state logic?"',
    time: '1h ago',
    read: false,
    actionType: 'SECONDARY',
    actionLabel: 'Reply',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'mock-3',
    group: 'TODAY',
    type: 'MILESTONE',
    title: 'Milestone Approved',
    description: 'The client has approved Milestone 1: "Initial Design Concepts". Funds have been released to your pending balance.',
    time: '3h ago',
    read: true,
    actionType: 'NONE'
  },
  {
    id: 'mock-4',
    group: 'YESTERDAY',
    type: 'SECURITY',
    title: 'Security Alert: New Login',
    description: 'We noticed a new login to your account from a Mac device in Seattle, WA. If this was you, no action is needed.',
    time: 'Yesterday, 4:20 PM',
    read: true,
    actionType: 'NONE'
  },
  {
    id: 'mock-5',
    group: 'YESTERDAY',
    type: 'REPORT',
    title: 'Weekly Analytics Report',
    description: 'Your profile views are up 15% this week. Check out your full analytics dashboard for deeper insights.',
    time: 'Yesterday, 9:00 AM',
    read: true,
    actionType: 'LINK',
    actionLabel: 'View Report →'
  }
])

const allNotifications = computed<NotificationItem[]>(() => {
  if (store.notifications && store.notifications.length > 0) {
    return store.notifications.map((n) => ({
      id: n.id,
      group: new Date(n.createdAt).toDateString() === new Date().toDateString() ? 'TODAY' : 'YESTERDAY',
      type: n.resourceType || 'MESSAGE',
      title: n.title || 'Notification',
      description: n.message || '',
      time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: n.read,
      actionType: 'NONE',
      actionLabel: ''
    }))
  }
  return mockNotifications.value
})

const unreadCount = computed(() => allNotifications.value.filter((n) => !n.read).length)

const todayNotifications = computed(() => allNotifications.value.filter((n) => n.group === 'TODAY'))
const yesterdayNotifications = computed(() => allNotifications.value.filter((n) => n.group === 'YESTERDAY'))

const markAllAsRead = async () => {
  mockNotifications.value.forEach((n) => {
    n.read = true
  })
  try {
    await store.markAllAsRead()
  } catch (e) {
    console.warn('Backend markAllAsRead failed, updated mock state locally.', e)
  }
}

const handleActionClick = (item: any) => {
  if (item.actionLabel === 'Reply') {
    router.push('/chat')
  } else if (item.actionLabel === 'View Report →') {
    router.push('/freelancer/dashboard')
  } else {
    alert(`Action clicked: ${item.actionLabel || 'View Detail'}`)
  }
}

onMounted(async () => {
  try {
    await store.fetchNotifications({ page: 1, pageSize: 20 })
  } catch (e) {
    console.warn('Failed to fetch real notifications, using mockup dashboard.', e)
  }
})
</script>

<template>
  <section class="notifications-page">
    <!-- Header -->
    <header class="head">
      <div>
        <h1 class="page-title">Notifications</h1>
        <p class="page-subtitle" v-if="unreadCount > 0">You have {{ unreadCount }} unread messages.</p>
        <p class="page-subtitle" v-else>You are all caught up.</p>
      </div>
      <button class="mark-read-btn" @click="markAllAsRead">Mark all as read</button>
    </header>

    <ErrorState v-if="store.error" :message="store.error" />

    <div v-else-if="store.loading" class="loading-wrap">
      <LoadingState />
    </div>

    <div v-else class="list-container">
      
      <!-- TODAY GROUP -->
      <div v-if="todayNotifications.length">
        <h3 class="group-title">Today</h3>
        
        <div 
          v-for="item in todayNotifications" 
          :key="item.id" 
          class="notification-card"
          :class="{ unread: !item.read }"
        >
          <!-- Left Column: Icon or Avatar -->
          <div class="left-col">
            <img v-if="item.avatar" :src="item.avatar" class="avatar-img" alt="User avatar" />
            <div v-else class="icon-wrapper" :class="item.type.toLowerCase()">
              <!-- Briefcase for Offer -->
              <svg v-if="item.type === 'OFFER'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <!-- Checkmark for Milestone -->
              <svg v-else-if="item.type === 'MILESTONE'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <!-- Shield for Security -->
              <svg v-else-if="item.type === 'SECURITY'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <!-- Document for Report -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>

          <!-- Middle Column: Content -->
          <div class="content-col">
            <div class="notif-title">{{ item.title }}</div>
            <div class="notif-desc">{{ item.description }}</div>
            <!-- Actions -->
            <div class="notif-actions" v-if="item.actionType !== 'NONE'">
              <button 
                v-if="item.actionType === 'PRIMARY'" 
                class="action-btn-primary"
                @click="handleActionClick(item)"
              >
                {{ item.actionLabel }}
              </button>
              <button 
                v-else-if="item.actionType === 'SECONDARY'" 
                class="action-btn-secondary"
                @click="handleActionClick(item)"
              >
                {{ item.actionLabel }}
              </button>
              <a 
                v-else-if="item.actionType === 'LINK'" 
                href="#" 
                class="action-link"
                @click.prevent="handleActionClick(item)"
              >
                {{ item.actionLabel }}
              </a>
            </div>
          </div>

          <!-- Right Column: Time and Unread Dot -->
          <div class="right-col">
            <span class="notif-time">{{ item.time }}</span>
            <span class="unread-dot" v-if="!item.read"></span>
          </div>
        </div>
      </div>

      <!-- YESTERDAY GROUP -->
      <div v-if="yesterdayNotifications.length">
        <h3 class="group-title">Yesterday</h3>
        
        <div 
          v-for="item in yesterdayNotifications" 
          :key="item.id" 
          class="notification-card"
          :class="{ unread: !item.read }"
        >
          <!-- Left Column: Icon or Avatar -->
          <div class="left-col">
            <img v-if="item.avatar" :src="item.avatar" class="avatar-img" alt="User avatar" />
            <div v-else class="icon-wrapper" :class="item.type.toLowerCase()">
              <svg v-if="item.type === 'OFFER'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <svg v-else-if="item.type === 'MILESTONE'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="item.type === 'SECURITY'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>

          <!-- Middle Column: Content -->
          <div class="content-col">
            <div class="notif-title">{{ item.title }}</div>
            <div class="notif-desc">{{ item.description }}</div>
            <!-- Actions -->
            <div class="notif-actions" v-if="item.actionType !== 'NONE'">
              <button 
                v-if="item.actionType === 'PRIMARY'" 
                class="action-btn-primary"
                @click="handleActionClick(item)"
              >
                {{ item.actionLabel }}
              </button>
              <button 
                v-else-if="item.actionType === 'SECONDARY'" 
                class="action-btn-secondary"
                @click="handleActionClick(item)"
              >
                {{ item.actionLabel }}
              </button>
              <a 
                v-else-if="item.actionType === 'LINK'" 
                href="#" 
                class="action-link"
                @click.prevent="handleActionClick(item)"
              >
                {{ item.actionLabel }}
              </a>
            </div>
          </div>

          <!-- Right Column: Time and Unread Dot -->
          <div class="right-col">
            <span class="notif-time">{{ item.time }}</span>
            <span class="unread-dot" v-if="!item.read"></span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.notifications-page { display: flex; flex-direction: column; gap: 1.5rem; font-family: 'Inter', sans-serif; }

/* Header */
.head { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { margin: 0; font-size: 2rem; font-weight: 800; color: #0f172a; }
.page-subtitle { margin: 0.35rem 0 0; font-size: 1rem; color: #475569; }
.mark-read-btn { border: 1px solid #0b57d0; color: #0b57d0; background: #fff; border-radius: 8px; padding: 0.55rem 1.1rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
.mark-read-btn:hover { background: #f0f4ff; }

.list-container { display: flex; flex-direction: column; gap: 0.5rem; }

/* Group title (Today, Yesterday) */
.group-title { font-size: 0.78rem; font-weight: 700; color: #64748b; letter-spacing: 0.07em; text-transform: uppercase; margin: 1.5rem 0 0.85rem 0; }

.loading-wrap { padding: 4rem; display: flex; align-items: center; justify-content: center; }

/* Notification card */
.notification-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem 1.5rem; display: flex; gap: 1.25rem; position: relative; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); margin-bottom: 0.85rem; box-sizing: border-box; transition: border-color 0.15s ease; }

/* Unread card highlighting matching the screenshot */
.notification-card.unread { border-left: 4px solid #0b57d0; background: #f0f4ff; border-color: #cbd5e1; }

/* Left column icons */
.left-col { flex-shrink: 0; }
.avatar-img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid #cbd5e1; }
.icon-wrapper { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }

.icon-wrapper.offer { background: #0b57d0; color: #ffffff; }
.icon-wrapper.milestone { background: #eff6ff; color: #0b57d0; border: 1px solid #bfdbfe; }
.icon-wrapper.security { background: #eff6ff; color: #0b57d0; border: 1px solid #bfdbfe; }
.icon-wrapper.report { background: #eff6ff; color: #0b57d0; border: 1px solid #bfdbfe; }

/* Middle content column */
.content-col { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; min-width: 0; }
.notif-title { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
.notif-desc { font-size: 0.875rem; color: #475569; line-height: 1.5; }

/* Buttons & actions inside content */
.notif-actions { margin-top: 0.5rem; display: flex; gap: 0.5rem; }
.action-btn-primary { border: none; background: #0b57d0; color: #ffffff; padding: 0.5rem 1.1rem; font-size: 0.825rem; font-weight: 700; border-radius: 6px; cursor: pointer; transition: background 0.15s ease; }
.action-btn-primary:hover { background: #094cb4; }

.action-btn-secondary { border: 1px solid #cbd5e1; background: #ffffff; color: #0b57d0; padding: 0.5rem 1.1rem; font-size: 0.825rem; font-weight: 700; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; }
.action-btn-secondary:hover { background: #f0f4ff; border-color: #94a3b8; }

.action-link { color: #0b57d0; font-size: 0.85rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; }
.action-link:hover { text-decoration: underline; }

/* Right column for time and unread dot */
.right-col { display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; gap: 0.5rem; flex-shrink: 0; }
.notif-time { font-size: 0.8rem; color: #64748b; font-weight: 600; white-space: nowrap; }
.unread-dot { width: 8px; height: 8px; background: #0b57d0; border-radius: 50%; margin-top: 0.25rem; }
</style>
