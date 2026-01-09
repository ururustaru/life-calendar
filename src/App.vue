<template>
  <div id="app">
    <BirthDateModal 
      :show="showBirthDateModal" 
      :current-date="calendarData?.birthDate"
      @save="handleBirthDateSave"
    />
    
    <CalendarNameModal
      :show="showCalendarNameModal"
      default-name="Мой календарь"
      @save="handleCalendarNameSave"
      @close="showCalendarNameModal = false"
    />
    
    <CalendarEditModal
      :show="showCalendarEditModal"
      :calendar="calendarData"
      @save="handleCalendarEditSave"
      @close="showCalendarEditModal = false"
    />
    
    <EventModal 
      v-if="showEventModal"
      :show="showEventModal"
      :editing-event="editingEvent"
      @close="closeEventModal"
      @save="handleEventSave"
      @delete="handleEventDelete"
    />
    
    <LifeCalendar
      v-if="calendarData"
      :data="calendarData"
      :calendars-list="getCalendarsList()"
      :current-calendar-id="calendarData?.id || ''"
      @add-event="openEventModal"
      @add-event-at-week="handleAddEventAtWeek"
      @edit-event="handleEditEvent"
      @delete-event="handleEventDelete"
      @export="handleExport"
      @import="handleImport"
      @switch-calendar="handleSwitchCalendar"
      @create-new-calendar="handleCreateNewCalendar"
      @delete-calendar="handleDeleteCalendar"
      @edit-calendar="handleEditCalendar"
    />
    
    <div v-else class="loading">
      <p>Загрузка...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BirthDateModal from './components/BirthDateModal.vue'
import EventModal from './components/EventModal.vue'
import CalendarNameModal from './components/CalendarNameModal.vue'
import CalendarEditModal from './components/CalendarEditModal.vue'
import LifeCalendar from './components/LifeCalendar.vue'
import type { CalendarData, LifeEvent } from './types'
import { 
  loadCurrentCalendar, 
  saveCalendar, 
  exportToFile, 
  importFromFile,
  getCalendarsList,
  loadCalendarById,
  setCurrentCalendarId,
  createNewCalendar,
  deleteCalendar
} from './utils/storage'
import { getDateFromWeekPosition } from './utils/dateUtils'

const calendarData = ref<CalendarData | null>(null)
const showBirthDateModal = ref(false)
const showEventModal = ref(false)
const showCalendarNameModal = ref(false)
const showCalendarEditModal = ref(false)
const editingEvent = ref<LifeEvent | null>(null)
const pendingBirthDate = ref<string | null>(null)

onMounted(() => {
  const saved = loadCurrentCalendar()
  if (saved && saved.birthDate) {
    calendarData.value = saved
  } else {
    showBirthDateModal.value = true
  }
})

function handleBirthDateSave(date: string) {
  if (!calendarData.value) {
    // Если нет календаря, сначала запрашиваем название
    pendingBirthDate.value = date
    showBirthDateModal.value = false
    showCalendarNameModal.value = true
  } else {
    calendarData.value.birthDate = date
    calendarData.value.updatedAt = new Date().toISOString()
    saveCalendar(calendarData.value)
    showBirthDateModal.value = false
  }
}

function handleCalendarNameSave(name: string) {
  if (pendingBirthDate.value) {
    calendarData.value = createNewCalendar(name, pendingBirthDate.value)
    pendingBirthDate.value = null
    showCalendarNameModal.value = false
  }
}

function openEventModal() {
  editingEvent.value = null
  showEventModal.value = true
}

function handleAddEventAtWeek(year: number, week: number) {
  if (!calendarData.value) return
  
  // Вычисляем дату для этой недели
  const birthDate = new Date(calendarData.value.birthDate)
  const weekDate = getDateFromWeekPosition(birthDate, year, week)
  
  // Создаем временное событие с предзаполненной датой
  editingEvent.value = {
    id: 'temp-' + Date.now(),
    type: 'date',
    name: '',
    color: '#007bff',
    startDate: weekDate.toISOString()
  } as LifeEvent
  
  showEventModal.value = true
}

function handleEditEvent(event: LifeEvent) {
  editingEvent.value = event
  showEventModal.value = true
}

function closeEventModal() {
  showEventModal.value = false
  editingEvent.value = null
}

function handleEventSave(event: Omit<LifeEvent, 'id'>) {
  if (!calendarData.value) return
  
  if (editingEvent.value && !editingEvent.value.id.startsWith('temp-')) {
    // Редактирование существующего события
    const index = calendarData.value.events.findIndex(e => e.id === editingEvent.value!.id)
    if (index !== -1) {
      calendarData.value.events[index] = {
        ...event,
        id: editingEvent.value.id
      }
    }
  } else {
    // Добавление нового события (включая временные события с предзаполненной датой)
    const newEvent: LifeEvent = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    calendarData.value.events.push(newEvent)
  }
  
  saveCalendar(calendarData.value)
  closeEventModal()
}

function handleEventDelete(id: string) {
  if (!calendarData.value) return
  
  calendarData.value.events = calendarData.value.events.filter(e => e.id !== id)
  calendarData.value.updatedAt = new Date().toISOString()
  saveCalendar(calendarData.value)
}

function handleExport() {
  if (!calendarData.value) {
    alert('Нет данных для экспорта')
    return
  }
  exportToFile(calendarData.value)
}

function handleSwitchCalendar(calendarId: string) {
  const calendar = loadCalendarById(calendarId)
  if (calendar) {
    // Создаем новый объект, чтобы Vue правильно отследил изменение
    calendarData.value = { ...calendar }
    setCurrentCalendarId(calendarId)
  }
}

function handleCreateNewCalendar() {
  // Просто создаем новый календарь без экспорта и подтверждения
  calendarData.value = null
  pendingBirthDate.value = null
  showBirthDateModal.value = true
}

function handleEditCalendar() {
  if (calendarData.value) {
    showCalendarEditModal.value = true
  }
}

function handleCalendarEditSave(data: { name: string; birthDate: string }) {
  if (!calendarData.value) return
  
  // Создаем новый объект для обновления реактивности
  calendarData.value = {
    ...calendarData.value,
    name: data.name,
    birthDate: data.birthDate,
    updatedAt: new Date().toISOString()
  }
  saveCalendar(calendarData.value)
  showCalendarEditModal.value = false
}

function handleDeleteCalendar(calendarId: string) {
  if (!calendarData.value) return
  
  const calendars = getCalendarsList()
  if (calendars.length <= 1) {
    alert('Нельзя удалить единственный календарь')
    return
  }
  
  if (confirm('Вы уверены, что хотите удалить этот календарь? Это действие нельзя отменить.')) {
    deleteCalendar(calendarId)
    
    // Если удалили текущий календарь, загружаем первый из оставшихся
    if (calendarId === calendarData.value.id) {
      const remainingCalendars = getCalendarsList()
      if (remainingCalendars.length > 0) {
        const newCalendar = loadCalendarById(remainingCalendars[0].id)
        if (newCalendar) {
          calendarData.value = { ...newCalendar }
        }
      } else {
        calendarData.value = null
        showBirthDateModal.value = true
      }
    }
  }
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    try {
      const data = await importFromFile(file)
      
      // Создаем новый календарь из импортированных данных
      // Генерируем новый ID, чтобы не затереть текущий календарь
      const importedCalendar: CalendarData = {
        ...data,
        id: 'imported-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: data.name || 'Импортированный календарь',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Сохраняем новый календарь
      saveCalendar(importedCalendar)
      
      // Переключаемся на импортированный календарь
      calendarData.value = { ...importedCalendar }
      setCurrentCalendarId(importedCalendar.id)
      
      alert('Календарь успешно импортирован и открыт')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка при импорте данных')
    }
  }
  input.click()
}
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 18px;
  color: #666;
}
</style>