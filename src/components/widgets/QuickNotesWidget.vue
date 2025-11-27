<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'QuickNotesWidget',
})

interface Note {
  id: string
  text: string
  timestamp: Date
}

const notes = ref<Note[]>([])
const noteInput = ref('')
const nextId = ref(1)
const selectedNote = ref<Note | null>(null)

function addNote() {
  if (noteInput.value.trim()) {
    notes.value.unshift({
      id: `note-${nextId.value}`,
      text: noteInput.value,
      timestamp: new Date(),
    })
    nextId.value++
    noteInput.value = ''
  }
}

function deleteNote(id: string) {
  notes.value = notes.value.filter((n) => n.id !== id)
  if (selectedNote.value?.id === id) {
    selectedNote.value = null
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addNote()
  }
}

function openNote(note: Note) {
  selectedNote.value = note
}

function closeNote() {
  selectedNote.value = null
}

function getPreview(text: string, length = 80) {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= length) return trimmed
  return trimmed.slice(0, length) + '…'
}
</script>

<template>
  <div class="quicknotes">
    <div class="notes-input-wrapper">
      <textarea
        v-model="noteInput"
        class="notes-input"
        placeholder="Quick note..."
        @keydown="handleKeydown"
      />
      <button class="notes-add-btn" @click="addNote" :disabled="!noteInput.trim()">Add</button>
    </div>

    <div class="notes-list">
      <div v-if="notes.length === 0" class="notes-empty">No notes yet. Add one!</div>

      <div v-for="note in notes" :key="note.id" class="note-item" @click="openNote(note)">
        <div class="note-main">
          <p class="note-text-preview">
            {{ getPreview(note.text) || 'Empty note' }}
          </p>
          <span class="note-time">{{ formatTime(note.timestamp) }}</span>
        </div>
        <button class="note-delete" @click.stop="deleteNote(note.id)" title="Delete note">✕</button>
      </div>
    </div>

    <!-- Modal für volle Note -->
    <Teleport to="body">
      <div v-if="selectedNote" class="note-modal-backdrop" @click.self="closeNote">
        <div class="note-modal">
          <header class="note-modal-header">
            <div class="note-modal-meta">
              <span class="note-modal-date">
                {{ formatDate(selectedNote.timestamp) }}
              </span>
              <span class="note-modal-time">
                {{ formatTime(selectedNote.timestamp) }}
              </span>
            </div>
            <div class="note-modal-actions">
              <button
                class="note-modal-delete"
                @click="deleteNote(selectedNote.id)"
                title="Delete note"
              >
                Delete
              </button>
              <button class="note-modal-close" @click="closeNote">Close</button>
            </div>
          </header>

          <section class="note-modal-body">
            <pre class="note-modal-text">{{ selectedNote.text }}</pre>
          </section>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.quicknotes {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

/* Input */
.notes-input-wrapper {
  display: flex;
  gap: var(--space-sm);
}

.notes-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface-soft);
  color: var(--text);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  resize: none;
  max-height: 80px;
  transition: all var(--transition-base);
}

.notes-input:focus {
  outline: none;
  border-color: var(--accent);
  background-color: var(--surface);
}

.notes-add-btn {
  padding: var(--space-sm) var(--space-lg);
  background-color: var(--accent);
  color: var(--surface);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.notes-add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.notes-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Liste */
.notes-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  overflow-y: auto;
  padding-right: var(--space-sm);
  min-height: 0;
}

.notes-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  padding: var(--space-lg) var(--space-md);
}

.note-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  cursor: pointer;
}

.note-item:hover {
  background-color: var(--surface);
  border-color: var(--accent);
}

.note-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
}

.note-text-preview {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.note-delete {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.note-delete:hover {
  background-color: rgba(248, 113, 113, 0.1);
  color: #fecaca;
}

/* Modal */
.note-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* über Widgets */
}

.note-modal {
  width: min(800px, 90vw);
  max-height: 80vh;
  background-color: var(--surface);
  border-radius: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.note-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border);
}

.note-modal-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.note-modal-date {
  font-size: var(--font-size-sm);
  color: var(--text);
}

.note-modal-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.note-modal-actions {
  display: flex;
  gap: var(--space-sm);
}

.note-modal-delete,
.note-modal-close {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background-color: var(--surface-soft);
  color: var(--text);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}

.note-modal-delete:hover {
  border-color: #f87171;
  background-color: rgba(248, 113, 113, 0.1);
  color: #fecaca;
}

.note-modal-close:hover {
  border-color: var(--accent);
  background-color: var(--accent-soft);
}

.note-modal-body {
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  overflow-y: auto;
}

.note-modal-text {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--text);
  white-space: pre-wrap;
}
</style>
