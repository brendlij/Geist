<script setup lang="ts"></script>

<template>
  <div class="home-view">
    <div class="welcome-section">
      <h1>Welcome to Geist</h1>
      <p>A minimal and elegant dashboard application</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <h3>🎨 Beautiful Themes</h3>
        <p>Switch between light and dark themes with smooth transitions</p>
      </div>

      <div class="feature-card">
        <h3>⚡ Fast & Responsive</h3>
        <p>Built with Vue 3 and TypeScript for optimal performance</p>
      </div>

      <div class="feature-card">
        <h3>📦 Pocketbase Ready</h3>
        <p>Integrated backend support with Pocketbase</p>
      </div>

      <div class="feature-card">
        <h3>🎯 Simple Structure</h3>
        <p>Clean and organized component architecture</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: var(--space-2xl);
  padding: var(--space-2xl) 0;
}

.welcome-section h1 {
  margin-bottom: var(--space-md);
  font-size: var(--font-size-3xl);
  color: var(--text);
}

.welcome-section p {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.feature-card {
  padding: var(--space-lg);
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.feature-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-card h3 {
  margin-top: 0;
  margin-bottom: var(--space-sm);
  color: var(--accent);
  font-size: var(--font-size-lg);
}

.feature-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

@media (max-width: 640px) {
  .welcome-section {
    padding: var(--space-lg) 0;
  }

  .welcome-section h1 {
    font-size: var(--font-size-2xl);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
