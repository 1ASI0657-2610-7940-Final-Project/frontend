<script setup lang="ts">
import SupportTicketForm from '../components/SupportTicketForm.vue'
import { chatApi } from '@chat/api/chatApi'

const submit = async (payload: { subject: string; description: string }) => {
  await chatApi.createSupportTicket(payload)
}
</script>

<template>
  <section class="page">
    <header>
      <h1 class="page-title">Submit a Request</h1>
      <p class="muted">Please fill out the form with details of your issue. Support responds within 24 hours.</p>
    </header>

    <div class="layout">
      <SupportTicketForm @submit="submit" />

      <aside class="side">
        <section class="card block">
          <h3>Helpful Resources</h3>
          <ul>
            <li>Knowledge Base</li>
            <li>Frequently Asked Questions</li>
            <li>Community Forums</li>
            <li>Video Tutorials</li>
          </ul>
        </section>
        <section class="card block">
          <h3>Direct Contact</h3>
          <p>Email: support@gigu.com</p>
          <p>Operating Hours: Mon - Fri, 9am - 6pm ET</p>
        </section>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.page { display: grid; gap: 1rem; }
.layout { display: grid; grid-template-columns: 1fr 390px; gap: 1rem; align-items: start; }
.side { display: grid; gap: 1rem; }
.block { padding: 1rem; }
ul { margin: 0.5rem 0 0; padding-left: 1.1rem; color: #475569; display: grid; gap: 0.45rem; }
p { color: #475569; }
@media (max-width: 980px) { .layout { grid-template-columns: 1fr; } }
</style>
