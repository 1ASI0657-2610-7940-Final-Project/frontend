<script setup lang="ts">
import { ref } from 'vue'
import { chatApi } from '@chat/api/chatApi'
import Toast from '../../../shared/components/Toast.vue'

const subject = ref('')
const category = ref('')
const description = ref('')
const success = ref('')
const busy = ref(false)

const submit = async () => {
  if (!subject.value.trim() || !description.value.trim()) return
  busy.value = true
  try {
    const fullDescription = category.value 
      ? `[Category: ${category.value}]\n\n${description.value}` 
      : description.value
    await chatApi.createSupportTicket({ subject: subject.value, description: fullDescription })
    success.value = 'Ticket submitted. Our support team will respond shortly.'
    subject.value = ''
    category.value = ''
    description.value = ''
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    console.error('Failed to submit ticket:', err)
  } finally {
    busy.value = false
  }
}

const cancel = () => {
  subject.value = ''
  category.value = ''
  description.value = ''
}
</script>

<template>
  <section class="support-page">
    <!-- Header -->
    <header class="support-header">
      <h1 class="page-title">Submit a Request</h1>
      <p class="page-subtitle">
        Please fill out the form below with the details of your issue. Our support team aims to respond to all inquiries within 24 hours.
      </p>
    </header>

    <div class="support-layout">
      <!-- Left side form card -->
      <main class="form-card">
        <Toast v-if="success" :message="success" type="success" />

        <div class="form-group">
          <label class="field-label">Subject</label>
          <input 
            v-model="subject" 
            type="text" 
            placeholder="Briefly summarize your issue" 
            class="form-input" 
            :disabled="busy"
          />
        </div>

        <div class="form-group">
          <label class="field-label">Category</label>
          <div class="select-wrapper">
            <select v-model="category" class="custom-select" :disabled="busy">
              <option value="" disabled selected>Select an issue category</option>
              <option value="ACCOUNT_ACCESS">Account Access</option>
              <option value="PAYMENT_BILLING">Payment & Billing</option>
              <option value="GIG_SERVICES">Gig Services & Delivery</option>
              <option value="SAFETY_DISPUTES">Disputes & Safety</option>
              <option value="TECHNICAL_BUG">Technical Bug / System Error</option>
              <option value="OTHER">Other Support Issue</option>
            </select>
            <svg class="select-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <div class="form-group">
          <label class="field-label">Description</label>
          <textarea 
            v-model="description" 
            placeholder="Provide as much detail as possible to help us resolve your issue quickly." 
            class="form-textarea"
            rows="6"
            :disabled="busy"
          ></textarea>
          <span class="helper-text">
            Please include relevant details such as gig IDs, error messages, or steps to reproduce the issue.
          </span>
        </div>

        <div class="divider"></div>

        <div class="form-actions">
          <button class="btn-cancel" @click="cancel" :disabled="busy">Cancel</button>
          <button 
            class="btn-submit" 
            @click="submit" 
            :disabled="busy || !subject.trim() || !description.trim()"
          >
            {{ busy ? 'Submitting...' : 'Submit Ticket' }}
          </button>
        </div>
      </main>

      <!-- Right side panels -->
      <aside class="sidebar-column">
        <!-- Helpful Resources Panel -->
        <article class="resources-card">
          <h2 class="sidebar-title">
            <svg class="title-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Helpful Resources
          </h2>
          <nav class="resources-list">
            <a href="#" class="resource-item">
              <span>Knowledge Base</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#" class="resource-item">
              <span>Frequently Asked Questions</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#" class="resource-item">
              <span>Community Forums</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#" class="resource-item">
              <span>Video Tutorials</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </nav>
        </article>

        <!-- Direct Contact Panel -->
        <article class="contact-card">
          <span class="contact-card-label">DIRECT CONTACT</span>
          
          <div class="contact-details">
            <div class="detail-row">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <div class="detail-text">
                <span class="primary-text">Email Support</span>
                <a href="mailto:support@gigu.com" class="support-email">support@gigu.com</a>
              </div>
            </div>
            <div class="detail-row">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div class="detail-text">
                <span class="primary-text">Operating Hours</span>
                <span class="secondary-text">Mon - Fri, 9am - 6pm EST</span>
              </div>
            </div>
          </div>
        </article>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.support-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
}

.support-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin: 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  max-width: 720px;
  line-height: 1.5;
}

/* Layout */
.support-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form Card */
.form-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #475569;
}

.form-input {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #0f172a;
  font-family: inherit;
  outline: none;
  transition: all 0.15s ease;
}

.form-input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 2px rgba(0, 86, 179, 0.08);
}

/* Select custom styling */
.select-wrapper {
  position: relative;
  display: flex;
}

.custom-select {
  width: 100%;
  appearance: none;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  padding: 0.75rem 2.75rem 0.75rem 1rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: #0f172a;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.custom-select:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 2px rgba(0, 86, 179, 0.08);
}

.select-chevron {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Textarea custom styling */
.form-textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #0f172a;
  font-family: inherit;
  outline: none;
  resize: vertical;
  min-height: 120px;
  transition: all 0.15s ease;
}

.form-textarea:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 2px rgba(0, 86, 179, 0.08);
}

.helper-text {
  font-size: 0.8125rem;
  color: #64748b;
  line-height: 1.4;
}

.divider {
  border-top: 1px solid #cbd5e1;
  margin: 0.5rem 0;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0056b3;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 8px;
  padding: 0.65rem 1.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-submit {
  border: none;
  background: #0056b3;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 8px;
  padding: 0.65rem 1.5rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #004bb5;
}

.btn-submit:disabled, .btn-cancel:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Resources Card */
.resources-card {
  background: #f0f4ff; /* light blue/indigo card background */
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sidebar-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  color: #2563eb;
  flex-shrink: 0;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  text-decoration: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
  transition: all 0.15s ease;
}

.resource-item:hover {
  background: #f8fafc;
  color: #2563eb;
}

.resource-item svg {
  color: #94a3b8;
  transition: transform 0.15s ease;
}

.resource-item:hover svg {
  color: #2563eb;
  transform: translateX(3px);
}

/* Contact Card */
.contact-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
}

.contact-card-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.05em;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.detail-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.detail-text .primary-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
}

.support-email {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
}

.support-email:hover {
  text-decoration: underline;
}

.detail-text .secondary-text {
  font-size: 0.8125rem;
  color: #64748b;
}

@media (max-width: 960px) {
  .support-layout {
    grid-template-columns: 1fr;
  }
}
</style>
