<template>
  <div v-if="show" class="modal-overlay" @click.self="handleSubmit">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Укажите дату рождения</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="birth-date">Дата рождения</label>
          <input 
            id="birth-date"
            v-model="birthDate" 
            type="date" 
            class="form-control"
            required
            :max="maxDate"
          />
          <small class="form-hint">
            Это дата начала вашего календаря жизни (90 лет)
          </small>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            Сохранить
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  show: boolean
  currentDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentDate: undefined
})

const emit = defineEmits<{
  'save': [date: string]
}>()

const birthDate = ref(props.currentDate || '')

const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

function handleSubmit() {
  if (!birthDate.value) {
    return
  }
  
  const date = new Date(birthDate.value)
  if (date > new Date()) {
    alert('Дата рождения не может быть в будущем')
    return
  }
  
  emit('save', date.toISOString())
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
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
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
  padding: 20px;
  border-bottom: 2px solid #eee;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-align: center;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
}

.form-hint {
  display: block;
  margin-top: 6px;
  color: #666;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #eee;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  /* Улучшение для touch-устройств */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: 95%;
    margin: 10px;
    border-radius: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 18px;
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
    padding: 10px;
    font-size: 16px; /* Предотвращаем зум на iOS */
    border-radius: 8px;
  }

  .form-hint {
    font-size: 11px;
  }

  .form-actions {
    margin-top: 20px;
    padding-top: 16px;
  }

  .btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 15px;
    border-radius: 10px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 100%;
    max-width: 100%;
    margin: 0;
    border-radius: 0;
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