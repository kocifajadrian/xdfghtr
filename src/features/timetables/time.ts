import type { Connection, Leg, Stop } from './types'

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function formatTime(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
}

export function firstStop(leg: Leg): Stop {
  return leg.stops[0]
}

export function lastStop(leg: Leg): Stop {
  return leg.stops[leg.stops.length - 1]
}

export function departure(connection: Connection): string {
  return firstStop(connection.legs[0]).time
}

export function arrival(connection: Connection): string {
  return lastStop(connection.legs[connection.legs.length - 1]).time
}

export function durationMin(connection: Connection): number {
  // Past midnight the arrival time is smaller than the departure time, so the difference wraps around a day.
  return (toMinutes(arrival(connection)) - toMinutes(departure(connection)) + 1440) % 1440
}

export function transfers(connection: Connection): number {
  return connection.legs.filter((leg) => leg.kind === 'transit').length - 1
}

export function totalPrice(connection: Connection): number {
  return connection.legs.reduce((sum, leg) => sum + (leg.kind === 'transit' ? leg.price : 0), 0)
}

export function largestDelay(connection: Connection): number {
  return connection.legs.reduce((max, leg) => (leg.kind === 'transit' ? Math.max(max, leg.delayMin) : max), 0)
}
