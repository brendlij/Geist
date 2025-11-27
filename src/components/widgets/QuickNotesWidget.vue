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
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addNote()
  }
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

      <div v-for="note in notes" :key="note.id" class="note-item">
        <div class="note-content">
          <p class="note-text">{{ note.text }}</p>
          <span class="note-time">{{ formatTime(note.timestamp) }}</span>
        </div>
        <button class="note-delete" @click="deleteNote(note.id)" title="Delete note">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quicknotes {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

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

.notes-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  overflow-y: auto;
  padding-right: var(--space-sm);
}

.notes-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  padding: var(--space-lg) var(--space-md);
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.note-item:hover {
  background-color: var(--surface);
  border-color: var(--accent);
}

.note-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
}

.note-text {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text);
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
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
</style>
