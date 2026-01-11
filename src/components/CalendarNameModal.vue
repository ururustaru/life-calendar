<template>
  <div v-if="show" class="modal-overlay" @click.self="handleCancel">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Название календаря</h2>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="calendar-name">Введите название календаря</label>
          <input 
            id="calendar-name"
            v-model="calendarName" 
            type="text" 
            class="form-control"
            placeholder="Например: Мой календарь"
            required
            maxlength="50"
            autofocus
          />
          <small class="form-hint">
            Это название будет отображаться в списке календарей
          </small>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            Отмена
          </button>
          <button type="submit" class="btn btn-primary">
            Создать
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
  defaultName?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultName: 'Мой календарь'
})

const emit = defineEmits<{
  'close': []
  'save': [name: string]
}>()

const calendarName = ref(props.defaultName)

watch(() => props.show, (newValue) => {
  if (newValue) {
    calendarName.value = props.defaultName
  }
})

function handleSubmit() {
  if (!calendarName.value.trim()) {
    alert('Пожалуйста, введите название календаря')
    return
  }
  emit('save', calendarName.value.trim())
  emit('close')
}

function handleCancel() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s;
  backdrop-filter: blur(4px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 90%;
  max-width: 450px;
  box-shadow: 
    20px 20px 60px rgba(0, 0, 0, 0.15),
    -20px -20px 60px rgba(255, 255, 255, 0.8);
  animation: slideUp 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #666;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%);
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.8);
}

.form-control:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.8),
    0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-hint {
  display: block;
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    6px 6px 16px rgba(0, 0, 0, 0.1),
    -4px -4px 8px rgba(255, 255, 255, 0.8);
  /* Улучшение для touch-устройств */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 
    8px 8px 20px rgba(102, 126, 234, 0.3),
    -4px -4px 10px rgba(255, 255, 255, 0.5);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 
    10px 10px 24px rgba(102, 126, 234, 0.4),
    -4px -4px 10px rgba(255, 255, 255, 0.6);
}

.btn-secondary {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecef 100%);
  color: #495057;
  box-shadow: 
    6px 6px 16px rgba(0, 0, 0, 0.08),
    -4px -4px 10px rgba(255, 255, 255, 0.9);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e8ecef 0%, #f5f7fa 100%);
  color: #212529;
  transform: translateY(-2px);
  box-shadow: 
    8px 8px 20px rgba(0, 0, 0, 0.12),
    -4px -4px 10px rgba(255, 255, 255, 1);
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: 95%;
    margin: 10px;
    border-radius: 16px;
    max-height: 95vh;
    overflow-y: auto;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 18px;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    font-size: 28px;
  }

  .modal-body {
    padding: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-control {
    padding: 12px 16px;
    font-size: 16px; /* Предотвращаем зум на iOS */
    border-radius: 10px;
  }

  .form-hint {
    font-size: 11px;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
    padding-top: 16px;
  }

  .btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 15px;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 100%;
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .modal-header {
    padding: 14px;
  }

  .modal-header h2 {
    font-size: 17px;
  }

  .modal-body {
    padding: 14px;
  }

  .btn {
    padding: 11px 14px;
    font-size: 14px;
  }
}
</style>