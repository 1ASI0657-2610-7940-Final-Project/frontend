<script setup lang="ts">
import { ref } from 'vue'
import Toast from '../../../shared/components/Toast.vue'
import { chatApi } from '@chat/api/chatApi'

const props = defineProps<{ open: boolean; reportedUserId: string }>()
const emit = defineEmits<{ close: [] }>()

const reason = ref('')
const description = ref('')
const success = ref('')
const busy = ref(false)

const submit = async () => {
  if (!description.value.trim()) return
  busy.value = true
  try {
    await chatApi.reportUser({ 
      reportedUserId: props.reportedUserId, 
      reason: reason.value || 'INAPPROPRIATE_BEHAVIOR', 
      description: description.value 
    })
    success.value = 'Report submitted successfully.'
    setTimeout(() => {
      emit('close')
      success.value = ''
      description.value = ''
      reason.value = ''
    }, 1500)
  } catch (err) {
    console.error('Failed to submit report:', err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="modal-backdrop" v-if="open" @click="emit('close')">
        <div class="modal-card" @click.stop>
          
          <!-- Header -->
          <header class="modal-header">
            <span class="modal-title">Report User</span>
            <button class="close-btn" @click="emit('close')" aria-label="Close modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </header>

          <Toast v-if="success" :message="success" type="success" />

          <!-- Body -->
          <div class="modal-body">
            
            <!-- Confidential Reporting Info Alert -->
            <div class="info-alert">
              <div class="info-icon-wrap">
                <!-- Circular Icon with white 'i' -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#0056b3"/>
                  <path d="M12 16V11" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="7.5" r="1.25" fill="white"/>
                </svg>
              </div>
              <div class="info-content">
                <div class="info-title">Confidential Reporting</div>
                <div class="info-desc">This report is sent directly to the GigU Trust & Safety team. The reported user will not be notified.</div>
              </div>
            </div>

            <!-- Reason selection -->
            <div class="form-group">
              <label class="field-label">Reason for reporting</label>
              <div class="select-wrapper">
                <select v-model="reason" class="custom-select">
                  <option value="" disabled selected>Select an issue...</option>
                  <option value="INAPPROPRIATE_BEHAVIOR">Inappropriate Behavior</option>
                  <option value="SPAM">Spam</option>
                  <option value="HARASSMENT">Harassment</option>
                  <option value="FRAUD">Fraud or Scam</option>
                  <option value="OTHER">Other Issue</option>
                </select>
                <!-- Double arrow chevron for select custom layout -->
                <svg class="select-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <!-- Description details -->
            <div class="form-group">
              <label class="field-label">Description</label>
              <textarea 
                v-model="description" 
                placeholder="Provide specific details about your concern..." 
                class="details-textarea"
                rows="5"
                required
              ></textarea>
              <span class="helper-text">Please include dates, messages, or context to help us investigate thoroughly.</span>
            </div>

          </div>

          <!-- Footer Actions -->
          <footer class="modal-footer">
            <button class="btn-cancel" @click="emit('close')" :disabled="busy">Cancel</button>
            <button class="btn-submit" @click="submit" :disabled="busy || !description.trim() || !reason">
              {{ busy ? 'Submitting...' : 'Submit Report' }}
            </button>
          </footer>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Modal backdrop overlay */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(138, 148, 166, 0.95); /* matching screenshot */
  display: grid;
  place-items: center;
  z-index: 1100;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
}

/* Modal White Card */
.modal-card {
  width: min(500px, 95%);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem 0.5rem 2rem;
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s ease;
}
.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* Body Content */
.modal-body {
  padding: 0.75rem 2rem 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Info Alert Box */
.info-alert {
  background: #eff6ff; /* Soft blue background */
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}
.info-icon-wrap {
  margin-top: 0.15rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.info-title {
  font-weight: 700;
  font-size: 0.875rem;
  color: #1e3a8a;
}
.info-desc {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #2563eb;
}

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #334155;
}

/* Select wrapper */
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
  padding: 0.85rem 2.75rem 0.85rem 1rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1e293b;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.custom-select:focus {
  border-color: #0b57d0;
  box-shadow: 0 0 0 2px rgba(11, 87, 208, 0.1);
}
.select-chevron {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Textarea input */
.details-textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  outline: none;
  font-size: 0.875rem;
  color: #1e293b;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.2s ease;
}
.details-textarea:focus {
  border-color: #0b57d0;
  box-shadow: 0 0 0 2px rgba(11, 87, 208, 0.1);
}
.helper-text {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 0.15rem;
  line-height: 1.4;
}

/* Footer actions */
.modal-footer {
  border-top: 1px solid #cbd5e1;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.btn-cancel {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0056b3;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 8px;
  padding: 0.65rem 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-cancel:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.btn-submit {
  border: none;
  background: #0056b3; /* Rich blue matching screenshot */
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 8px;
  padding: 0.65rem 2rem;
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
</style>
