<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'TodoListWidget',
})

interface Todo {
  id: string
  text: string
  completed: boolean
}

const todos = ref<Todo[]>([])
const todoInput = ref('')
const nextId = ref(1)

function addTodo() {
  if (todoInput.value.trim()) {
    todos.value.push({
      id: `todo-${nextId.value}`,
      text: todoInput.value,
      completed: false,
    })
    nextId.value++
    todoInput.value = ''
  }
}

function toggleTodo(id: string) {
  const todo = todos.value.find((t) => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

function deleteTodo(id: string) {
  todos.value = todos.value.filter((t) => t.id !== id)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addTodo()
  }
}

const completedCount = () => todos.value.filter((t) => t.completed).length
const totalCount = () => todos.value.length
</script>

<template>
  <div class="todolist">
    <div class="todo-header">
      <h3 class="todo-title">To-Do List</h3>
      <span v-if="totalCount() > 0" class="todo-progress"
        >{{ completedCount() }}/{{ totalCount() }}</span
      >
    </div>

    <div class="todo-input-wrapper">
      <input
        v-model="todoInput"
        type="text"
        class="todo-input"
        placeholder="Add a task..."
        @keydown="handleKeydown"
      />
      <button class="todo-add-btn" @click="addTodo" :disabled="!todoInput.trim()">+</button>
    </div>

    <div class="todo-list">
      <div v-if="todos.length === 0" class="todo-empty">No tasks yet. Add one!</div>

      <div
        v-for="todo in todos"
        :key="todo.id"
        class="todo-item"
        :class="{ completed: todo.completed }"
      >
        <input
          type="checkbox"
          class="todo-checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo.id)"
        />
        <span class="todo-text">{{ todo.text }}</span>
        <button class="todo-delete" @click="deleteTodo(todo.id)" title="Delete task">✕</button>
      </div>
    </div>

    <div v-if="totalCount() > 0" class="todo-footer">
      <span class="todo-remaining">{{ totalCount() - completedCount() }} remaining</span>
    </div>
  </div>
</template>

<style scoped>
.todolist {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.todo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border);
}

.todo-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text);
}

.todo-progress {
  font-size: var(--font-size-sm);
  color: var(--accent);
  font-weight: 600;
}

.todo-input-wrapper {
  display: flex;
  gap: var(--space-sm);
}

.todo-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface-soft);
  color: var(--text);
  font-size: var(--font-size-sm);
  transition: all var(--transition-base);
}

.todo-input:focus {
  outline: none;
  border-color: var(--accent);
  background-color: var(--surface);
}

.todo-add-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--border);
  background-color: var(--accent);
  color: var(--surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-base);
}

.todo-add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.todo-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.todo-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  overflow-y: auto;
  padding-right: var(--space-sm);
}

.todo-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  padding: var(--space-lg) var(--space-md);
}

.todo-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.todo-item:hover {
  background-color: var(--surface);
  border-color: var(--accent);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-checkbox {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent);
}

.todo-text {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text);
  transition: all var(--transition-base);
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.todo-delete {
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
  font-size: var(--font-size-sm);
}

.todo-delete:hover {
  background-color: rgba(248, 113, 113, 0.1);
  color: #fecaca;
}

.todo-footer {
  text-align: center;
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
</style>
