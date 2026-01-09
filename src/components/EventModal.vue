<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ editingEvent ? 'Редактировать событие' : 'Добавить событие' }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="event-type">Тип события</label>
          <select 
            id="event-type" 
            v-model="formData.type" 
            class="form-control"
            required
          >
            <option value="range">Диапазон дат</option>
            <option value="date">Отдельная дата</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="event-name">Название</label>
          <input 
            id="event-name"
            v-model="formData.name" 
            type="text" 
            class="form-control"
            placeholder="Введите название события"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="event-color">Цвет</label>
          <div class="color-picker">
            <input 
              id="event-color"
              v-model="formData.color" 
              type="color" 
              class="color-input"
            />
            <input 
              v-model="formData.color" 
              type="text" 
              class="color-text"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="start-date">{{ formData.type === 'range' ? 'Начальная дата' : 'Дата' }}</label>
          <input 
            id="start-date"
            v-model="formData.startDate" 
            type="date" 
            class="form-control"
            required
          />
        </div>
        
        <div v-if="formData.type === 'range'" class="form-group">
          <label for="end-date">Конечная дата</label>
          <input 
            id="end-date"
            v-model="formData.endDate" 
            type="date" 
            class="form-control"
            required
          />
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Отмена
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingEvent ? 'Сохранить' : 'Добавить' }}
          </button>
          <button 
            v-if="editingEvent" 
            type="button" 
            class="btn btn-danger" 
            @click="handleDelete"
          >
            Удалить
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import type { LifeEvent, EventType } from '../types'

interface Props {
  show: boolean
  editingEvent?: LifeEvent | null
}

const props = withDefaults(defineProps<Props>(), {
  editingEvent: null
})

const emit = defineEmits<{
  'close': []
  'save': [event: Omit<LifeEvent, 'id'>]
  'delete': [id: string]
}>()

const formData = ref({
  type: 'range' as EventType,
  name: '',
  color: '#007bff',
  startDate: '',
  endDate: ''
})

const defaultColors = [
  '#007bff', '#28a745', '#dc3545', '#ffc107', 
  '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'
]

// Функция для форматирования даты в формат input[type="date"] (YYYY-MM-DD)
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Функция для заполнения формы
function populateForm() {
  if (props.editingEvent) {
    // Редактирование: заполняем поля текущими значениями
    try {
      const startDate = new Date(props.editingEvent.startDate)
      const endDate = props.editingEvent.endDate ? new Date(props.editingEvent.endDate) : null
      
      formData.value = {
        type: props.editingEvent.type,
        name: props.editingEvent.name || '',
        color: props.editingEvent.color || '#007bff',
        startDate: formatDateForInput(startDate),
        endDate: endDate ? formatDateForInput(endDate) : ''
      }
    } catch (error) {
      console.error('Ошибка при заполнении формы:', error)
      // При ошибке используем значения по умолчанию
      resetForm()
    }
  } else {
    // Добавление нового: заполняем значениями по умолчанию
    resetForm()
  }
}

// Функция для сброса формы к значениям по умолчанию
function resetForm() {
  formData.value = {
    type: 'range',
    name: '',
    color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
    startDate: '',
    endDate: ''
  }
}

// Заполняем форму при монтировании компонента
onMounted(() => {
  if (props.show) {
    nextTick(() => {
      populateForm()
    })
  }
})

// Обновляем форму при открытии модального окна или изменении редактируемого события
watch([() => props.show, () => props.editingEvent], () => {
  if (props.show) {
    // Используем nextTick, чтобы убедиться, что все пропсы обновлены
    nextTick(() => {
      populateForm()
    })
  }
})

function handleSubmit() {
  if (!formData.value.startDate) {
    alert('Пожалуйста, выберите дату')
    return
  }
  
  if (formData.value.type === 'range' && !formData.value.endDate) {
    alert('Пожалуйста, выберите конечную дату')
    return
  }
  
  if (formData.value.type === 'range') {
    const start = new Date(formData.value.startDate)
    const end = new Date(formData.value.endDate)
    
    if (end < start) {
      alert('Конечная дата не может быть раньше начальной')
      return
    }
  }
  
  const event: Omit<LifeEvent, 'id'> = {
    type: formData.value.type,
    name: formData.value.name,
    color: formData.value.color,
    startDate: new Date(formData.value.startDate).toISOString(),
    endDate: formData.value.type === 'range' 
      ? new Date(formData.value.endDate).toISOString() 
      : undefined
  }
  
  emit('save', event)
  emit('close')
}

function handleDelete() {
  if (props.editingEvent) {
    if (confirm('Вы уверены, что хотите удалить это событие?')) {
      emit('delete', props.editingEvent.id)
      emit('close')
    }
  }
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
  z-index: 1000;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #eee;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #666;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
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

.color-picker {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-text {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  box-shadow: 
    4px 4px 12px rgba(0, 0, 0, 0.08),
    -2px -2px 6px rgba(255, 255, 255, 0.8);
}

.btn:active {
  opacity: 0.95;
  box-shadow: 
    2px 2px 6px rgba(0, 0, 0, 0.08),
    -1px -1px 3px rgba(255, 255, 255, 0.8);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 
    6px 6px 16px rgba(102, 126, 234, 0.25),
    -2px -2px 8px rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #7285f0 0%, #8250b0 100%);
  box-shadow: 
    8px 8px 20px rgba(102, 126, 234, 0.35),
    -2px -2px 8px rgba(255, 255, 255, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecef 100%);
  color: #495057;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 
    4px 4px 10px rgba(0, 0, 0, 0.06),
    -2px -2px 6px rgba(255, 255, 255, 0.9);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 
    6px 6px 14px rgba(0, 0, 0, 0.08),
    -2px -2px 6px rgba(255, 255, 255, 1);
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  box-shadow: 
    6px 6px 16px rgba(220, 53, 69, 0.25),
    -2px -2px 8px rgba(255, 255, 255, 0.3);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #e04a5a 0%, #d12e3e 100%);
  box-shadow: 
    8px 8px 20px rgba(220, 53, 69, 0.35),
    -2px -2px 8px rgba(255, 255, 255, 0.4);
}
</style>