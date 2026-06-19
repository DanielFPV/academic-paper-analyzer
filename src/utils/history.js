const STORAGE_KEY = 'paper_analyzer_history'
const MAX_ITEMS = 10

export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistoryItem(title, result) {
  try {
    const history = getHistory()
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      result,
      timestamp: Date.now()
    }
    // 如果标题已存在，移到最前
    const filtered = history.filter((h) => h.title !== title)
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return newItem
  } catch {
    return null
  }
}

export function deleteHistoryItem(id) {
  try {
    const history = getHistory()
    const updated = history.filter((h) => h.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return true
  } catch {
    return false
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
