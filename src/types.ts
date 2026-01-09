export type EventType = 'range' | 'date'

export interface LifeEvent {
  id: string
  type: EventType
  name: string
  color: string
  startDate: string // ISO date string
  endDate?: string // ISO date string, only for range type
}

export interface CalendarData {
  id: string
  name: string
  birthDate: string // ISO date string
  events: LifeEvent[]
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

export interface WeekPosition {
  year: number // 0-89
  week: number // 0-51
}