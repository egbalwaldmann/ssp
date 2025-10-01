import { OrderStatus, Order, OrderItem } from '@prisma/client'

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['IN_REVIEW', 'REJECTED'],
  IN_REVIEW: ['PENDING_APPROVAL', 'APPROVED', 'ON_HOLD', 'REJECTED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'ON_HOLD'],
  APPROVED: ['ORDERED', 'CANCELLED'],
  ORDERED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['READY_FOR_PICKUP', 'DELIVERED'],
  READY_FOR_PICKUP: ['DELIVERED', 'COMPLETED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  ON_HOLD: ['IN_REVIEW', 'CANCELLED']
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export function requiresApproval(
  order: Order & { items: (OrderItem & { product: { requiresApproval: boolean } })[] }
): boolean {
  // Products with requiresApproval flag OR special requests
  return (
    order.items.some((item) => item.product.requiresApproval) ||
    !!order.specialRequest
  )
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Neu',
  IN_REVIEW: 'In Prüfung',
  PENDING_APPROVAL: 'Wartet auf Genehmigung',
  APPROVED: 'Genehmigt',
  ORDERED: 'Bestellt',
  IN_TRANSIT: 'Unterwegs',
  READY_FOR_PICKUP: 'Abholbereit',
  DELIVERED: 'Zugestellt',
  COMPLETED: 'Abgeschlossen',
  REJECTED: 'Abgelehnt',
  CANCELLED: 'Storniert',
  ON_HOLD: 'Pausiert'
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: 'bg-gray-100 text-gray-800 border-gray-300',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PENDING_APPROVAL: 'bg-orange-100 text-orange-800 border-orange-300',
  APPROVED: 'bg-green-100 text-green-800 border-green-300',
  ORDERED: 'bg-blue-100 text-blue-800 border-blue-300',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  READY_FOR_PICKUP: 'bg-purple-100 text-purple-800 border-purple-300',
  DELIVERED: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  COMPLETED: 'bg-teal-100 text-teal-800 border-teal-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
  ON_HOLD: 'bg-purple-100 text-purple-800 border-purple-300'
}

export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `BEST-${year}${month}${day}-${random}`
}

