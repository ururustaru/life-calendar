import type { WeekPosition } from '../types'

/**
 * Получить количество недель между двумя датами
  * Неделя считается от даты рождения (не обязательно понедельник)
 */
export function getWeeksBetween(startDate: Date, endDate: Date): number {
  // Нормализуем даты (убираем время)
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  
  // Вычисляем разницу в днях
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Количество полных недель (7 дней)
  return Math.floor(diffDays / 7)
}

/**
 * Получить позицию недели на графике (год и неделя в году)
 * Каждый год жизни начинается с недели 0 соответствующего года индекса
 * Для этого вычисляем год жизни на основе календарных лет, а не просто деления на 52
 */
export function getWeekPosition(birthDate: Date, targetDate: Date): WeekPosition | null {
  // Нормализуем даты
  const birth = new Date(birthDate)
  birth.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  
  // Вычисляем год жизни (календарный год от даты рождения)
  const birthYear = birth.getFullYear()
  const birthMonth = birth.getMonth()
  const birthDay = birth.getDate()
  
  const targetYear = target.getFullYear()
  const targetMonth = target.getMonth()
  const targetDay = target.getDate()
  
  // Определяем, сколько полных лет прошло
  let yearsPassed = targetYear - birthYear
  if (targetMonth < birthMonth || (targetMonth === birthMonth && targetDay < birthDay)) {
    yearsPassed--
  }
  
  if (yearsPassed < 0 || yearsPassed >= 90) {
    return null // Вне диапазона 90 лет
  }
  
  // Вычисляем дату начала текущего года жизни
  const currentYearStart = new Date(birthYear + yearsPassed, birthMonth, birthDay)
  currentYearStart.setHours(0, 0, 0, 0)
  
  // Вычисляем количество недель в текущем году жизни
  const weeksInCurrentYear = getWeeksBetween(currentYearStart, target)
  
  if (weeksInCurrentYear < 0 || weeksInCurrentYear >= 52) {
    // Если недель >= 52, значит уже следующий год
    return { year: yearsPassed, week: 51 }
  }
  
  return { year: yearsPassed, week: weeksInCurrentYear }
}

/**
 * Получить дату начала недели по году и неделе
 */
export function getDateFromWeekPosition(birthDate: Date, year: number, week: number): Date {
  const birth = new Date(birthDate)
  birth.setHours(0, 0, 0, 0)
  
  const birthYear = birth.getFullYear()
  const birthMonth = birth.getMonth()
  const birthDay = birth.getDate()
  
  // Вычисляем дату начала года жизни
  const yearStart = new Date(birthYear + year, birthMonth, birthDay)
  yearStart.setHours(0, 0, 0, 0)
  
  // Вычисляем дату начала недели (неделя 0 = начало года)
  const weekStart = new Date(yearStart)
  weekStart.setDate(weekStart.getDate() + week * 7)
  
  return weekStart
}

/**
 * Получить все недели в диапазоне
 * Используем Set для исключения дубликатов
 * Важно: учитываем все недели, которые пересекаются с диапазоном
 */
export function getWeeksInRange(birthDate: Date, startDate: Date, endDate: Date): WeekPosition[] {
  const weeksSet = new Set<string>()
  const weeks: WeekPosition[] = []
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  
  // Нормализуем дату рождения
  const birth = new Date(birthDate)
  birth.setHours(0, 0, 0, 0)
  
  // Вычисляем позицию startDate
  const startPosition = getWeekPosition(birth, start)
  if (!startPosition) {
    return weeks // Вне диапазона
  }
  
  // Вычисляем позицию endDate
  const endPosition = getWeekPosition(birth, end)
  if (!endPosition) {
    return weeks // Вне диапазона
  }
  
  // Проходим по всем неделям от startPosition до endPosition включительно
  let currentYear = startPosition.year
  let currentWeek = startPosition.week
  
  const endYear = endPosition.year
  const endWeek = endPosition.week
  
  while (currentYear < endYear || (currentYear === endYear && currentWeek <= endWeek)) {
    const key = `${currentYear}-${currentWeek}`
    if (!weeksSet.has(key)) {
      weeksSet.add(key)
      weeks.push({ year: currentYear, week: currentWeek })
    }
    
    // Переход к следующей неделе
    currentWeek++
    if (currentWeek >= 52) {
      currentWeek = 0
      currentYear++
      if (currentYear >= 90) {
        break // Вне диапазона 90 лет
      }
    }
  }
  
  return weeks
}

/**
 * Проверка, находится ли дата в диапазоне недели
 */
export function isDateInWeek(birthDate: Date, targetDate: Date, year: number, week: number): boolean {
  const position = getWeekPosition(birthDate, targetDate)
  if (!position) return false
  return position.year === year && position.week === week
}