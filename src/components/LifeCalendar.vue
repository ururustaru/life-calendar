<template>
  <div class="life-calendar-container">
    <div class="calendar-header">
      <div class="header-left">
        <h1>Ваша жизнь в неделях</h1>
        <div v-if="calendarsList.length > 0" class="calendar-selector">
          <select 
            :value="currentCalendarId" 
            @change="handleCalendarChange"
            class="calendar-select"
          >
            <option 
              v-for="calendar in calendarsList" 
              :key="calendar.id" 
              :value="calendar.id"
            >
              {{ calendar.name }}
            </option>
          </select>
          <button 
            @click="handleEditClick"
            class="calendar-edit-btn"
            :title="`Редактировать календарь ${getCurrentCalendarName()}`"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            v-if="calendarsList.length > 1"
            @click="handleDeleteClick"
            class="calendar-delete-btn"
            :title="`Удалить календарь ${getCurrentCalendarName()}`"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="controls">
        <button @click="$emit('create-new-calendar')" class="btn btn-secondary">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>Создать новый календарь</span>
        </button>
        <button @click="$emit('add-event')" class="btn btn-primary">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Добавить событие</span>
        </button>
        <button @click="$emit('export')" class="btn btn-secondary">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Экспорт</span>
        </button>
        <button @click="$emit('import')" class="btn btn-secondary">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Импорт</span>
        </button>
      </div>
    </div>
    
    <div class="calendar-wrapper">
      <div ref="legendRef" class="legend">
        <div class="legend-header">
          <h3 class="legend-title">Этапы</h3>
          <select v-model="sortOrder" class="sort-select">
            <option value="date-oldest">Сначала старые</option>
            <option value="date-newest">Сначала новые</option>
          </select>
        </div>
        <div class="legend-content">
          <div 
            v-for="event in sortedRangeEvents" 
            :key="event.id"
            class="legend-item"
            :title="getRangeEventTooltip(event)"
            @click="handleEventClick(event)"
          >
            <div 
              class="legend-color" 
              :style="{ backgroundColor: event.color }"
            ></div>
            <span class="legend-text">{{ event.name }}</span>
            <button
              class="delete-event-btn"
              @click.stop="handleDeleteEvent(event, $event)"
              title="Удалить событие"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="calendar-grid-container">
        <div ref="gridRef" class="calendar-grid">
          <div 
            v-for="year in 90" 
            :key="year"
            class="year-row"
            :style="{ 
              '--year-index': year - 1,
              '--week-cell-size': `${WEEK_CELL_SIZE}px`,
              '--week-cell-gap': `${WEEK_CELL_GAP}px`,
              '--week-cell-full-width': `${WEEK_CELL_FULL_WIDTH}px`,
              '--year-label-width': `${YEAR_LABEL_WIDTH}px`
            }"
          >
          <div class="year-label">{{ year - 1 }}</div>
          <div class="weeks-row">
            <div
              v-for="week in 52"
              :key="week"
              class="week-cell"
              :class="getWeekClasses(year - 1, week - 1)"
              :style="getWeekStyle(year - 1, week - 1)"
              :title="getWeekTooltip(year - 1, week - 1)"
              :data-year="year - 1"
              :data-week="week - 1"
              @click="handleWeekClick(year - 1, week - 1)"
            >
              <div 
                v-if="isMarkedWeek(year - 1, week - 1)" 
                class="week-marker"
              ></div>
            </div>
          </div>
          <div class="date-events-row">
            <div
              v-for="event in getDateEventsForYear(year - 1)"
              :key="event.id"
              class="date-event-label"
              :style="getDateEventLabelStyle(event, year - 1)"
              @click.stop="handleEventClick(event)"
            >
              <span class="date-event-text">{{ event.name }}</span>
            </div>
          </div>
        </div>
        </div>
        
      </div>
      
      <div v-if="dateEvents.length > 0" class="date-events-list">
        <div class="date-events-list-header">
          <h3 class="date-events-list-title">События</h3>
          <select v-model="sortOrder" class="sort-select">
            <option value="date-oldest">Сначала старые</option>
            <option value="date-newest">Сначала новые</option>
          </select>
        </div>
        <div class="date-events-list-content">
          <div
            v-for="event in sortedDateEvents"
            :key="event.id"
            class="date-event-list-item"
            @click="handleEventClick(event)"
          >
            <div 
              class="date-event-list-color" 
              :style="{ backgroundColor: event.color }"
            ></div>
            <div class="date-event-list-info">
              <div class="date-event-list-date">{{ formatEventDate(event.startDate) }}</div>
              <div class="date-event-list-name">{{ event.name }}</div>
            </div>
            <button
              class="delete-event-btn"
              @click.stop="handleDeleteEvent(event, $event)"
              title="Удалить событие"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { LifeEvent, CalendarData } from '../types'
import { getWeekPosition, getWeeksInRange } from '../utils/dateUtils'

import type { CalendarInfo } from '../utils/storage'

interface Props {
  data: CalendarData
  calendarsList?: CalendarInfo[]
  currentCalendarId?: string
}

const props = withDefaults(defineProps<Props>(), {
  calendarsList: () => [],
  currentCalendarId: ''
})

const emit = defineEmits<{
  'add-event': []
  'add-event-at-week': [year: number, week: number]
  'edit-event': [event: LifeEvent]
  'delete-event': [eventId: string]
  'export': []
  'import': []
  'switch-calendar': [calendarId: string]
  'create-new-calendar': []
  'delete-calendar': [calendarId: string]
  'edit-calendar': []
}>()

function handleCalendarChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('switch-calendar', target.value)
}

function handleEditClick() {
  emit('edit-calendar')
}

function handleDeleteClick() {
  if (props.currentCalendarId) {
    emit('delete-calendar', props.currentCalendarId)
  }
}

function getCurrentCalendarName(): string {
  const calendar = props.calendarsList.find(c => c.id === props.currentCalendarId)
  return calendar?.name || 'Календарь'
}

const birthDate = computed(() => new Date(props.data.birthDate))
const events = computed(() => props.data.events)

// CSS-переменные для размеров (используются в стилях и скриптах)
const WEEK_CELL_SIZE = 13 // Размер ячейки недели в пикселях
const WEEK_CELL_GAP = 2 // Отступ между ячейками в пикселях
const YEAR_LABEL_WIDTH = 50 // Ширина метки года в пикселях

// Вычисляем полную ширину ячейки (размер + gap)
const WEEK_CELL_FULL_WIDTH = WEEK_CELL_SIZE + WEEK_CELL_GAP

const rangeEvents = computed(() => 
  events.value.filter(e => e.type === 'range')
)

const dateEvents = computed(() => 
  events.value.filter(e => e.type === 'date')
)

// Состояние сортировки
const sortOrder = ref<'date-oldest' | 'date-newest' | 'added-first' | 'added-last'>('date-oldest')

// Функция для извлечения timestamp из ID события (для сортировки по порядку добавления)
function getEventTimestamp(event: LifeEvent): number {
  // ID содержит timestamp в начале (Date.now().toString())
  const match = event.id.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

// Отсортированные события-даты
const sortedDateEvents = computed(() => {
  const events = [...dateEvents.value]
  
  switch (sortOrder.value) {
    case 'date-oldest':
      return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    case 'date-newest':
      return events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    case 'added-first':
      return events.sort((a, b) => getEventTimestamp(a) - getEventTimestamp(b))
    case 'added-last':
      return events.sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
    default:
      return events
  }
})

// Отсортированные диапазоны дат
const sortedRangeEvents = computed(() => {
  const events = [...rangeEvents.value]
  
  switch (sortOrder.value) {
    case 'date-oldest':
      return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    case 'date-newest':
      return events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    case 'added-first':
      return events.sort((a, b) => getEventTimestamp(a) - getEventTimestamp(b))
    case 'added-last':
      return events.sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
    default:
      return events
  }
})

// Текущая позиция недели (прожито до сегодня)
const currentWeekPosition = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Сбрасываем время для точного сравнения
  const birth = new Date(birthDate.value)
  birth.setHours(0, 0, 0, 0) // Сбрасываем время для точного сравнения
  return getWeekPosition(birth, today)
})

// Refs для элементов
const gridRef = ref<HTMLElement | null>(null)
const gridWidth = ref(800)
const gridHeight = ref(1800)

// Кэш для быстрого поиска недель
const weekCache = ref<Map<string, LifeEvent[]>>(new Map())
const arrowPositions = ref<Map<string, { year: number; week: number }>>(new Map())

// Мемоизация стилей и классов для недель (оптимизация производительности)
const weekStylesCache = ref<Map<string, Record<string, string>>>(new Map())
const weekClassesCache = ref<Map<string, string[]>>(new Map())
const weekPassedCache = ref<Map<string, boolean>>(new Map())
const tooltipCache = ref<Map<string, string>>(new Map())
const dateEventsByYearCache = ref<Map<number, LifeEvent[]>>(new Map())


function handleWeekClick(year: number, week: number) {
  const key = `${year}-${week}`
  const weekEvents = weekCache.value.get(key)
  if (weekEvents && weekEvents.length > 0) {
    // При клике на неделю с событием открываем первое событие для редактирования
    emit('edit-event', weekEvents[0])
  } else {
    // При клике на пустую ячейку открываем модальное окно для добавления события
    emit('add-event-at-week', year, week)
  }
}

function handleEventClick(event: LifeEvent) {
  emit('edit-event', event)
}

function handleDeleteEvent(event: LifeEvent, mouseEvent: MouseEvent) {
  mouseEvent.stopPropagation() // Предотвращаем открытие модалки редактирования
  if (confirm('Вы уверены, что хотите удалить это событие?')) {
    emit('delete-event', event.id)
  }
}

function buildCache() {
  weekCache.value.clear()
  arrowPositions.value.clear()
  weekStylesCache.value.clear()
  weekClassesCache.value.clear()
  weekPassedCache.value.clear()
  tooltipCache.value.clear()
  dateEventsByYearCache.value.clear()
  
  if (!birthDate.value || isNaN(birthDate.value.getTime())) {
    return
  }
  
  const current = currentWeekPosition.value
  
  events.value.forEach(event => {
    if (event.type === 'range' && event.endDate) {
      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      const weeks = getWeeksInRange(birthDate.value, start, end)
      
      weeks.forEach(week => {
        const key = `${week.year}-${week.week}`
        if (!weekCache.value.has(key)) {
          weekCache.value.set(key, [])
        }
        weekCache.value.get(key)!.push(event)
      })
    } else if (event.type === 'date') {
      const target = new Date(event.startDate)
      const position = getWeekPosition(birthDate.value, target)
      if (position) {
        arrowPositions.value.set(event.id, position)
        const key = `${position.year}-${position.week}`
        if (!weekCache.value.has(key)) {
          weekCache.value.set(key, [])
        }
        weekCache.value.get(key)!.push(event)
      }
    }
  })
  
  // Предвычисляем стили и классы для всех недель (только для недель с событиями)
  // Это значительно ускоряет работу, так как большинство недель пустые
  if (current) {
    const totalWeeksCurrent = current.year * 52 + current.week
    
    // Сначала обрабатываем недели с событиями
    weekCache.value.forEach((weekEvents, key) => {
      const [year, week] = key.split('-').map(Number)
      
      // Классы
      const classes: string[] = ['has-event']
      const totalWeeksTarget = year * 52 + week
      if (totalWeeksTarget < totalWeeksCurrent) {
        classes.push('week-passed')
      }
      weekClassesCache.value.set(key, classes)
      
      // Стили
      const dateEvent = weekEvents.find(e => e.type === 'date')
      if (dateEvent) {
        weekStylesCache.value.set(key, {
          backgroundColor: dateEvent.color,
          border: `2px solid ${dateEvent.color}`
        })
      } else {
        const rangeEvent = weekEvents.find(e => e.type === 'range')
        if (rangeEvent) {
          weekStylesCache.value.set(key, {
            backgroundColor: rangeEvent.color,
            border: `2px solid ${rangeEvent.color}`
          })
        }
      }
    })
    
    // Для пустых недель предвычисляем только класс week-passed
    // Это делаем только для прожитых недель (до текущей)
    // Используем общее количество недель для точного сравнения
    for (let year = 0; year < 90; year++) {
      for (let week = 0; week < 52; week++) {
        const key = `${year}-${week}`
        if (!weekClassesCache.value.has(key)) {
          const totalWeeksTarget = year * 52 + week
          if (totalWeeksTarget < totalWeeksCurrent) {
            weekClassesCache.value.set(key, ['week-passed'])
          } else {
            weekClassesCache.value.set(key, [])
          }
        }
      }
    }
  }
}

function getWeekClasses(year: number, week: number): string[] {
  const key = `${year}-${week}`
  const cached = weekClassesCache.value.get(key)
  if (cached !== undefined) {
    return cached
  }
  
  // Если нет в кэше, вычисляем на лету (для будущих недель)
  const classes: string[] = []
  if (currentWeekPosition.value) {
    const current = currentWeekPosition.value
    const totalWeeksCurrent = current.year * 52 + current.week
    const totalWeeksTarget = year * 52 + week
    if (totalWeeksTarget < totalWeeksCurrent) {
      classes.push('week-passed')
    }
  }
  return classes
}

function getWeekStyle(year: number, week: number): Record<string, string> {
  const key = `${year}-${week}`
  return weekStylesCache.value.get(key) || {}
}

function isMarkedWeek(year: number, week: number): boolean {
  const key = `${year}-${week}`
  const weekEvents = weekCache.value.get(key)
  return weekEvents ? weekEvents.some(e => e.type === 'date') : false
}

function getWeekTooltip(year: number, week: number): string {
  const key = `${year}-${week}`
  const cached = tooltipCache.value.get(key)
  if (cached !== undefined) {
    return cached
  }
  
  const weekEvents = weekCache.value.get(key)
  let tooltip: string
  if (weekEvents && weekEvents.length > 0) {
    tooltip = weekEvents.map(e => e.name).join(', ')
  } else {
    tooltip = `Год ${year}, Неделя ${week + 1}`
  }
  
  tooltipCache.value.set(key, tooltip)
  return tooltip
}

// Получить все события-даты для конкретного года
function getDateEventsForYear(year: number): LifeEvent[] {
  return dateEvents.value.filter(event => {
    const position = arrowPositions.value.get(event.id)
    return position && position.year === year
  })
}

// Вычислить стиль для метки события-даты в строке
function getDateEventLabelStyle(event: LifeEvent, year: number): Record<string, string> {
  const position = arrowPositions.value.get(event.id)
  if (!position || position.year !== year) {
    return { display: 'none' }
  }
  
  // Используем CSS-переменные для согласованности
  // Позиция события в строке (в пикселях от начала weeks-row)
  // Центрируем над соответствующей неделей
  const leftPosition = YEAR_LABEL_WIDTH + position.week * WEEK_CELL_FULL_WIDTH + WEEK_CELL_SIZE / 2
  
  return {
    left: `${leftPosition}px`,
    transform: 'translateX(-50%)', // Центрируем относительно позиции
    borderColor: event.color // Цветная рамка с цветом события
  }
}

// Форматирование даты события для отображения в списке
function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

// Форматирование тултипа для диапазона дат
function getRangeEventTooltip(event: LifeEvent): string {
  if (event.type !== 'range' || !event.endDate) {
    return event.name
  }
  const startDate = formatEventDate(event.startDate)
  const endDate = formatEventDate(event.endDate)
  return `${event.name}\n${startDate} - ${endDate}`
}

function updateDimensions() {
  nextTick(() => {
    if (gridRef.value) {
      // Ширина календаря: метки года (60px) + 52 недели (52 * 13px)
      gridWidth.value = 60 + 52 * 13
      // Высота: 90 лет * (20px высота строки + 2px отступ)
      gridHeight.value = 90 * 22
    }
  })
}

// Отслеживаем только нужные поля для оптимизации
const dataId = computed(() => props.data.id)
const dataBirthDate = computed(() => props.data.birthDate)
const dataEventsHash = computed(() => {
  // Простой хэш для быстрой проверки изменений событий
  // Используем только id и даты, чтобы не пересчитывать при изменении других полей
  return props.data.events.map(e => `${e.id}-${e.startDate}-${e.endDate || ''}-${e.type}`).join('|')
})

// Обновляем кэш только при реальных изменениях данных
watch([dataId, dataBirthDate, dataEventsHash], () => {
  buildCache()
  nextTick(() => {
    updateDimensions()
  })
}, { immediate: true })

// Отдельный watcher для размеров (не нужно пересчитывать при каждом изменении)
watch(() => props.data.id, () => {
  nextTick(() => {
    updateDimensions()
  })
}, { immediate: true })

// Обновляем размеры после монтирования и при изменении размера окна
if (typeof window !== 'undefined') {
  nextTick(() => {
    updateDimensions()
  })
  window.addEventListener('resize', updateDimensions)
}
</script>

<style scoped>
.life-calendar-container {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  /* Упрощенная тень - один слой вместо трех */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  /* Убрали backdrop-filter - это очень тяжело для производительности */
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  gap: 20px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.calendar-selector {
  position: relative;
  display: flex;
}

.calendar-select {
  padding: 8px 16px;
  padding-right: 40px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%);
  backdrop-filter: blur(10px);
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    4px 4px 10px rgba(0, 0, 0, 0.06),
    -2px -2px 6px rgba(255, 255, 255, 0.9);
  appearance: none;
  background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22%3E%3Cpath fill=%22%231a1a1a%22 d=%22M6 9L1 4h10z%22/%3E%3C/svg%3E');
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.calendar-select:hover {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 
    6px 6px 14px rgba(0, 0, 0, 0.1),
    -2px -2px 8px rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.calendar-select:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 
    6px 6px 14px rgba(102, 126, 234, 0.2),
    -2px -2px 8px rgba(255, 255, 255, 1);
}

.calendar-edit-btn,
.calendar-delete-btn {
  margin-left: 8px;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    4px 4px 10px rgba(0, 0, 0, 0.06),
    -2px -2px 6px rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.calendar-edit-btn {
  color: #667eea;
  border-color: rgba(102, 126, 234, 0.2);
}

.calendar-edit-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
  box-shadow: 
    6px 6px 14px rgba(102, 126, 234, 0.15),
    -2px -2px 8px rgba(255, 255, 255, 1);
}

.calendar-edit-btn:active {
  transform: translateY(0);
  box-shadow: 
    2px 2px 6px rgba(102, 126, 234, 0.1),
    -1px -1px 4px rgba(255, 255, 255, 0.9);
}

.calendar-delete-btn {
  color: #dc3545;
  border-color: rgba(220, 53, 69, 0.2);
}

.calendar-edit-btn svg,
.calendar-delete-btn svg {
  width: 16px;
  height: 16px;
}

.calendar-delete-btn:hover {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
  border-color: rgba(220, 53, 69, 0.4);
  transform: translateY(-1px);
  box-shadow: 
    6px 6px 14px rgba(220, 53, 69, 0.15),
    -2px -2px 8px rgba(255, 255, 255, 1);
}

.calendar-delete-btn:active {
  transform: translateY(0);
  box-shadow: 
    2px 2px 6px rgba(220, 53, 69, 0.1),
    -1px -1px 4px rgba(255, 255, 255, 0.9);
}

.calendar-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.08);
  background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.controls {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
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

.btn-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 
    6px 6px 16px rgba(102, 126, 234, 0.25),
    -2px -2px 8px rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  /* Легкая подсветка без transform */
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
  /* Легкая подсветка без transform */
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 
    6px 6px 14px rgba(0, 0, 0, 0.08),
    -2px -2px 6px rgba(255, 255, 255, 1);
}

.calendar-wrapper {
  display: flex;
  gap: 20px;
  position: relative;
}

.calendar-grid-container {
  flex: 1;
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 90vh;
  /* Оптимизация прокрутки */
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
}

.calendar-grid {
  position: relative;
  /* Оптимизация рендеринга большого количества элементов */
  contain: layout style paint;
  /* Ускорение GPU */
  transform: translateZ(0);
}

.year-row {
  display: flex;
  align-items: center;
  min-height: 20px;
  margin-bottom: -2px;
  position: relative;
  /* Оптимизация рендеринга */
  /* contain: layout style paint; */
  /* Ускорение GPU */
  transform: translateZ(0);
}

.year-label {
  width: var(--year-label-width, 50px);
  font-size: 11px;
  color: #666;
  text-align: right;
  padding-right: 10px;
  flex-shrink: 0;
}

.weeks-row {
  display: flex;
  gap: var(--week-cell-gap, 2px);
  position: relative;
  /* Оптимизация рендеринга - изоляция слоя */
  contain: layout style paint;
  /* Ускорение GPU */
  transform: translateZ(0);
}

.date-events-row {
  position: absolute;
  left: 0;
  right: 0;
  top: -24px;
  height: 24px;
  pointer-events: none;
  z-index: 5;
  overflow: visible;
}

.date-event-label {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #ffffff;
  border-radius: 8px;
  /* Цветная рамка с цветом события */
  border: 2px solid;
  /* Упрощенная тень */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  font-size: 11px;
  pointer-events: auto;
  cursor: pointer;
  /* Упрощенные переходы */
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  z-index: 10;
  top: 0; /* Позиционируем в начале date-events-row (который уже смещен вверх) */
  /* transform будет установлен динамически через getDateEventLabelStyle */
  /* Оптимизация */
  will-change: box-shadow;
  contain: layout style paint;
}

.date-event-label:hover {
  /* Упрощенная тень при hover */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 15;
}

.date-event-text {
  color: #333;
  font-weight: 500;
}

.week-cell {
  width: var(--week-cell-size, 13px);
  height: var(--week-cell-size, 13px);
  background-color: #f0f0f0;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  /* Упрощенные переходы - только нужные свойства */
  transition: border-color 0.15s ease, background-color 0.15s ease;
  /* Оптимизация рендеринга */
  contain: layout style paint;
  will-change: border-color;
}

.week-cell:hover {
  border-color: rgba(102, 126, 234, 0.6);
  border-width: 2px;
  /* Убрали transform: scale - это очень тяжело для производительности */
  z-index: 10;
  /* Упрощенная тень */
  box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.2);
}

.week-cell.has-event {
  border-width: 2px;
}

.week-cell.week-passed {
  background-color: #939393;
    border-color: #696969;
  opacity: 0.7;
}

.week-cell.week-passed.has-event {
  opacity: 0.9;
}

.week-marker {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid #333;
  border-radius: 2px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.date-events-list {
  min-width: 250px;
  padding: 0 20px;
  border-left: 2px solid #eee;
  border-right: 2px solid #eee;
  max-height: 90vh;
  overflow-y: auto;
}

.date-events-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
  gap: 12px;
}

.date-events-list-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 0.5px 1px rgba(0, 0, 0, 0.08);
  background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex: 1;
}

.date-events-list-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.date-event-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  /* Упрощенные переходы */
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  /* Упрощенная тень */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  /* Оптимизация */
  contain: layout style paint;
}

.date-event-list-item:hover {
  background-color: #f8f9fa;
  border-color: rgba(102, 126, 234, 0.3);
  /* Упрощенная тень при hover */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  /* Убрали transform - это тяжело */
}

.date-event-list-item:active {
  background-color: #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.date-event-list-color {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  box-shadow: 
    2px 2px 6px rgba(0, 0, 0, 0.15),
    inset -1px -1px 3px rgba(0, 0, 0, 0.1),
    inset 1px 1px 3px rgba(255, 255, 255, 0.5);
}

.date-event-list-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.date-event-list-date {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.date-event-list-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-event-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #dc3545;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  opacity: 0.6;
  position: absolute;
  top: 5px;
  right: 5px;
}

.delete-event-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  opacity: 1;
}

.delete-event-btn svg {
  width: 16px;
  height: 16px;
}

.date-event-list-item:hover .delete-event-btn,
.legend-item:hover .delete-event-btn {
  display: flex;
}

.legend {
  min-width: 250px;
  position: relative;
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
  gap: 12px;
}

.legend-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 0.5px 1px rgba(0, 0, 0, 0.08);
  background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex: 1;
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-text {
  flex: 1;
  min-width: 0;
}

.sort-select {
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  min-width: 160px;
}

.sort-select:hover {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.sort-select:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  /* Упрощенные переходы */
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  /* Упрощенная тень */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  /* Оптимизация */
  contain: layout style paint;
}

.legend-item:hover {
  background-color: #f8f9fa;
  border-color: rgba(102, 126, 234, 0.2);
  /* Упрощенная тень при hover */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  /* Убрали transform - это тяжело */
}



.legend-color {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  box-shadow: 
    2px 2px 6px rgba(0, 0, 0, 0.15),
    inset -1px -1px 3px rgba(0, 0, 0, 0.1),
    inset 1px 1px 3px rgba(255, 255, 255, 0.5);
}

.legend-color-small {
  width: 16px;
  height: 16px;
}

.legend-text {
  font-size: 13px;
  color: #333;
}

@media (max-width: 768px) {
  .calendar-wrapper {
    flex-direction: column;
    gap: 20px;
  }
  
  .date-events-list {
    border-left: none;
    border-right: none;
    border-top: 2px solid #eee;
    border-bottom: 2px solid #eee;
    padding: 20px 0;
    max-height: 400px;
  }
  
  .legend {
    border-left: none;
    border-top: 2px solid #eee;
    padding-left: 0;
    padding-top: 20px;
  }
}
</style>