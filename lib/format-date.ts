// The server runs in UTC but the bakery works in Lagos time.
const TIME_ZONE = 'Africa/Lagos'

export function formatDate(value: string | Date): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(date)

  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('day')} ${pick('month')} ${pick('year')}`
}

export function formatDateTime(value: string | Date): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return `${formatDate(date)}, ${time}`
}