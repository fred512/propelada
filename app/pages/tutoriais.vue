<template>
  <div class="tutoriais-container">
    <div class="page-title-section">
      <h1 class="page-title">Tutoriais ProPelada</h1>
    </div>

    <div class="tutoriais-grid">
      <div
        v-for="tutorial in tutoriais"
        :key="tutorial.id"
        class="tutorial-card card"
        @click="openVideo(tutorial)"
      >
        <div class="thumbnail">
          <img
            :src="`https://img.youtube.com/vi/${tutorial.videoId}/hqdefault.jpg`"
            :alt="tutorial.titulo"
          />
          <div class="play-overlay">
            <PlayCircle :size="56" />
          </div>
        </div>
        <div class="tutorial-info">
          <span class="tutorial-title">{{ tutorial.titulo }}</span>
        </div>
      </div>
    </div>

    <!-- Modal de vídeo -->
    <div v-if="selectedTutorial" class="video-modal" @click.self="closeVideo">
      <div class="video-wrapper">
        <button class="close-btn" @click="closeVideo">
          <X :size="24" />
        </button>
        <iframe
          :src="`https://www.youtube.com/embed/${selectedTutorial.videoId}?autoplay=1`"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
          class="video-iframe"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlayCircle, X } from 'lucide-vue-next'

const tutoriais = [
  { id: 1, titulo: 'Cadastrar uma Pelada', videoId: 'P7aiYY7LZlw' },
  { id: 2, titulo: 'Cadastrar um Participante', videoId: '2Hw2gn6kZfA' },
  { id: 3, titulo: 'Cadastrar uma Partida', videoId: 'USJwTcQITC4' },
  { id: 4, titulo: 'Acessar como Visitante', videoId: 'tNGXZIkkfLs' },
]

const selectedTutorial = ref(null)

function openVideo(tutorial) {
  selectedTutorial.value = tutorial
}

function closeVideo() {
  selectedTutorial.value = null
}
</script>

<style scoped>
.tutoriais-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.page-title-section { display: flex; align-items: center; padding-top: 15px; }

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.tutoriais-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.tutorial-card {
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.tutorial-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.thumbnail {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.tutorial-card:hover .play-overlay {
  opacity: 1;
}

.tutorial-info {
  padding: 14px 16px;
}

.tutorial-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
  display: block;
}

/* Modal */
.video-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 10;
  padding: 4px;
}

.video-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
