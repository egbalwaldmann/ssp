import { OrderStatus, Order, OrderItem } from '@prisma/client'

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['IN_REVIEW', 'REJECTED'],
  IN_REVIEW: ['PENDING_APPROVAL', 'APPROVED', 'ON_HOLD', 'REJECTED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'ON_HOLD'],
  APPROVED: ['ORDERED', 'CANCELLED'],
  ORDERED: ['ORDER_CONFIRMED', 'CANCELLED'],
  ORDER_CONFIRMED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['NOTIFIED', 'COMPLETED'],
  NOTIFIED: ['INVOICE_VERIFIED', 'COMPLETED'],
  INVOICE_VERIFIED: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  ON_HOLD: ['IN_REVIEW', 'CANCELLED']
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

// Role-based status permissions
export const ROLE_ALLOWED_STATUS: Record<string, OrderStatus[]> = {
  // Führungskräfte: Nur Genehmigungen
  APPROVER: ['APPROVED', 'REJECTED'],
  
  // IT Support: Operative Schritte (IT-Artikel)
  IT_SUPPORT: [
    'IN_REVIEW', 
    'ORDERED', 
    'ORDER_CONFIRMED', 
    'IN_TRANSIT', 
    'DELIVERED', 
    'NOTIFIED', 
    'INVOICE_VERIFIED', 
    'COMPLETED',
    'CANCELLED',
    'ON_HOLD'
  ],
  
  // Empfang: Operative Schritte (Büromaterial)
  EMPFANG: [
    'IN_REVIEW', 
    'ORDERED', 
    'ORDER_CONFIRMED', 
    'IN_TRANSIT', 
    'DELIVERED', 
    'NOTIFIED', 
    'INVOICE_VERIFIED', 
    'COMPLETED',
    'CANCELLED',
    'ON_HOLD'
  ],
  
  // Admin: Alles
  ADMIN: [
    'NEW', 'IN_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 
    'ORDER_CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 
    'NOTIFIED', 'INVOICE_VERIFIED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'ON_HOLD'
  ]
}

export function canUserUpdateToStatus(userRole: string, fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  // Prüfe erst ob Transition grundsätzlich erlaubt ist
  if (!canTransition(fromStatus, toStatus)) {
    return false
  }
  
  // Prüfe rollenbasierte Berechtigung
  const allowedStatuses = ROLE_ALLOWED_STATUS[userRole] || []
  return allowedStatuses.includes(toStatus)
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
  ORDER_CONFIRMED: 'Bestellbestätigung erhalten',
  IN_TRANSIT: 'Unterwegs',
  DELIVERED: 'Zugestellt',
  NOTIFIED: 'Mitarbeiter informiert',
  INVOICE_VERIFIED: 'Rechnung geprüft',
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
  ORDER_CONFIRMED: 'bg-sky-100 text-sky-800 border-sky-300',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  DELIVERED: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  NOTIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  INVOICE_VERIFIED: 'bg-lime-100 text-lime-800 border-lime-300',
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

