export type HabitLog = {
    id: string
    habit_id: string
    date: string
    value?: number
    completed?: boolean
    created_at: string
}

export type Habit = {
    id: string
    name: string
    is_active: boolean
    created_at: string
}

export function calculateStreak(logs: HabitLog[]): number {
    if (!logs || logs.length === 0) return 0

    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Unique dates
    const uniqueDates = Array.from(new Set(sortedLogs.map(l => l.date)))
    
    if (uniqueDates.length === 0) return 0

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    let streak = 0
    let lastDate = uniqueDates[0]

    // Check if the sequence starts today or yesterday
    if (lastDate !== today && lastDate !== yesterday) {
        return 0
    }

    // Special case: if today is logged, we start counting. 
    // If today is NOT logged, but yesterday IS, streak is still alive, we start counting from yesterday.
    // The loop basically just checks consecutive days.
    
    let checkDate = new Date(lastDate)

    for (let i = 0; i < uniqueDates.length; i++) {
        const currentDate = uniqueDates[i]
        
        // If it's the first one, it matches "LastDate" which we validated is today or yesterday.
        if (i === 0) {
            streak++
            continue
        }

        // Expected previous day
        checkDate.setDate(checkDate.getDate() - 1)
        const expectedDate = checkDate.toISOString().split('T')[0]

        if (currentDate === expectedDate) {
            streak++
        } else {
            break
        }
    }

    return streak
}

export function getSmartSuggestions(habits: Habit[], logs: HabitLog[]): Habit | null {
    const now = new Date()
    const currentHour = now.getHours()
    
    // 1. Group logs by habit
    const habitLogs: Record<string, HabitLog[]> = {}
    logs.forEach(log => {
        if (!habitLogs[log.habit_id]) habitLogs[log.habit_id] = []
        habitLogs[log.habit_id].push(log)
    })

    const today = now.toISOString().split('T')[0]

    // 2. Find a habit that hasn't been done today but is usually done around this time
    for (const habit of habits) {
        // Skip if already done today
        const doneToday = logs.some(l => l.habit_id === habit.id && l.date === today)
        if (doneToday) continue

        const hLogs = habitLogs[habit.id]
        if (!hLogs || hLogs.length < 3) continue // Need some data

        // Calculate average hour
        const hours = hLogs.map(l => new Date(l.created_at).getHours())
        const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length
        
        // Check if current time is close (within 2 hours)
        if (Math.abs(currentHour - avgHour) <= 2) {
            return habit
        }
    }

    return null
}
