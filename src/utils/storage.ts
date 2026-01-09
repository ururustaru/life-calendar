import type { CalendarData, LifeEvent } from '../types'

const STORAGE_KEY = 'life-calendar-data'
const CALENDARS_STORAGE_KEY = 'life-calendars-list'
const CURRENT_CALENDAR_KEY = 'life-calendar-current'

export interface CalendarInfo {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

// Получить список всех календарей
export function getCalendarsList(): CalendarInfo[] {
  try {
    const data = localStorage.getItem(CALENDARS_STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data) as CalendarInfo[]
  } catch (error) {
    console.error('Ошибка загрузки списка календарей:', error)
    return []
  }
}

// Получить ID текущего календаря
export function getCurrentCalendarId(): string | null {
  return localStorage.getItem(CURRENT_CALENDAR_KEY)
}

// Установить текущий календарь
export function setCurrentCalendarId(id: string): void {
  localStorage.setItem(CURRENT_CALENDAR_KEY, id)
}

// Загрузить календарь по ID
export function loadCalendarById(id: string): CalendarData | null {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}-${id}`)
    if (!data) return null
    return JSON.parse(data) as CalendarData
  } catch (error) {
    console.error('Ошибка загрузки календаря:', error)
    return null
  }
}

// Загрузить текущий календарь
export function loadCurrentCalendar(): CalendarData | null {
  const currentId = getCurrentCalendarId()
  if (!currentId) {
    // Попытка загрузить старый формат (миграция)
    return loadFromStorageLegacy()
  }
  return loadCalendarById(currentId)
}

// Загрузить старый формат (для обратной совместимости)
function loadFromStorageLegacy(): CalendarData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    const oldData = JSON.parse(data) as { birthDate?: string; events?: LifeEvent[]; name?: string }
    
    if (!oldData.birthDate) return null
    
    // Миграция старого формата - сохраняем имя если было, иначе используем дефолтное
    const newData: CalendarData = {
      id: 'legacy-' + Date.now(),
      name: oldData.name || 'Мой календарь',
      birthDate: oldData.birthDate,
      events: oldData.events || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Сохраняем в новом формате и очищаем старый
    saveCalendar(newData)
    localStorage.removeItem(STORAGE_KEY)
    setCurrentCalendarId(newData.id)
    
    return newData
  } catch (error) {
    console.error('Ошибка миграции данных:', error)
    return null
  }
}

// Сохранить календарь
export function saveCalendar(data: CalendarData): void {
  try {
    const now = new Date().toISOString()
    data.updatedAt = now
    if (!data.createdAt) {
      data.createdAt = now
    }
    
    // Сохраняем календарь
    localStorage.setItem(`${STORAGE_KEY}-${data.id}`, JSON.stringify(data))
    
    // Обновляем список календарей
    const calendars = getCalendarsList()
    const existingIndex = calendars.findIndex(c => c.id === data.id)
    const calendarInfo: CalendarInfo = {
      id: data.id,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
    
    if (existingIndex >= 0) {
      calendars[existingIndex] = calendarInfo
    } else {
      calendars.push(calendarInfo)
    }
    
    localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(calendars))
    setCurrentCalendarId(data.id)
  } catch (error) {
    console.error('Ошибка сохранения календаря:', error)
  }
}

// Удалить календарь
export function deleteCalendar(id: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY}-${id}`)
    const calendars = getCalendarsList().filter(c => c.id !== id)
    localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(calendars))
    
    // Если удалили текущий календарь, переключаемся на первый из списка
    if (getCurrentCalendarId() === id) {
      if (calendars.length > 0) {
        setCurrentCalendarId(calendars[0].id)
      } else {
        localStorage.removeItem(CURRENT_CALENDAR_KEY)
      }
    }
  } catch (error) {
    console.error('Ошибка удаления календаря:', error)
  }
}

// Создать новый календарь
export function createNewCalendar(name: string, birthDate: string): CalendarData {
  const id = 'calendar-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  const now = new Date().toISOString()
  
  const newCalendar: CalendarData = {
    id,
    name,
    birthDate,
    events: [],
    createdAt: now,
    updatedAt: now
  }
  
  saveCalendar(newCalendar)
  return newCalendar
}

// Обратная совместимость (для старых вызовов)
export function loadFromStorage(): CalendarData | null {
  return loadCurrentCalendar()
}

export function saveToStorage(data: CalendarData): void {
  saveCalendar(data)
}

export function exportToFile(data: CalendarData): void {
  try {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `life-calendar-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка экспорта данных:', error)
    alert('Ошибка при экспорте данных')
  }
}

export function importFromFile(file: File): Promise<CalendarData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as Partial<CalendarData> & { birthDate?: string; events?: LifeEvent[]; name?: string }
        // Валидация данных
        if (!data.birthDate || !Array.isArray(data.events)) {
          throw new Error('Неверный формат файла')
        }
        
        // Если данные в старом формате (без id, name и т.д.), конвертируем
        // Сохраняем имя если было, иначе используем имя из файла или дефолтное
        const now = new Date().toISOString()
        const importedData: CalendarData = {
          id: data.id || 'imported-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          name: data.name || 'Импортированный календарь',
          birthDate: data.birthDate,
          events: data.events || [],
          createdAt: data.createdAt || now,
          updatedAt: data.updatedAt || now
        }
        
        resolve(importedData)
      } catch (error) {
        reject(new Error('Ошибка при чтении файла: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка')))
      }
    }
    reader.onerror = () => reject(new Error('Ошибка при чтении файла'))
    reader.readAsText(file)
  })
}