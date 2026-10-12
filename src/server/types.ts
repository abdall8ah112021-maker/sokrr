// Sugar Business - Server Type Definitions and Permission Constants

export type UserRole = 'CUSTOMER' | 'BUSINESS' | 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';

export type AccountStatus = 'PENDING' | 'REQUIRES_CHANGES' | 'ACTIVE' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type CardStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'EXPIRED';

export type CardAction = 'ISSUE' | 'ASSIGN' | 'SUSPEND' | 'BLOCK' | 'REPLACE';

export type PointLedgerType = 'EARN' | 'SPEND' | 'EXPIRE' | 'REVERSE' | 'RESERVE' | 'RELEASE' | 'ADJUSTMENT';

export type ServiceRequestStatus = 'NEW' | 'UNDER_REVIEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type OfferStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'STOPPED' | 'EXPIRED';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';

export type PaymentType = 'CASH' | 'POINTS';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export type NotificationType =
  | 'POINTS_EARNED'
  | 'POINTS_EXPIRY'
  | 'CARD_EXPIRY'
  | 'CARD_REQUEST'
  | 'SERVICE_UPDATE'
  | 'ORDER_STATUS'
  | 'OFFER'
  | 'NEWS'
  | 'ADMIN_ALERT';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type SupportTicketStatus = 'NEW' | 'UNDER_REVIEW' | 'WAITING_REPLY' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

// Standard RBAC Permissions
export const Permissions = {
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_SUSPEND: 'customers.suspend',
  CUSTOMERS_APPROVE: 'customers.approve',

  BUSINESSES_READ: 'businesses.read',
  BUSINESSES_CREATE: 'businesses.create',
  BUSINESSES_UPDATE: 'businesses.update',
  BUSINESSES_APPROVE: 'businesses.approve',
  BUSINESSES_SUSPEND: 'businesses.suspend',

  EMPLOYEES_MANAGE: 'employees.manage',

  CARDS_READ: 'cards.read',
  CARDS_ISSUE: 'cards.issue',
  CARDS_ASSIGN: 'cards.assign',
  CARDS_BLOCK: 'cards.block',
  CARDS_REPLACE: 'cards.replace',

  POINTS_READ: 'points.read',
  POINTS_ADJUST: 'points.adjust', // Super Admin only

  ORDERS_READ: 'orders.read',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_CANCEL: 'orders.cancel',

  SERVICES_MANAGE: 'services.manage',
  OFFERS_APPROVE: 'offers.approve',
  STORE_MANAGE: 'store.manage',
  CMS_MANAGE: 'cms.manage',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  SETTINGS_UPDATE: 'settings.update',
  AUDIT_READ: 'audit.read',
  JOBS_TRIGGER: 'jobs.trigger',
  SUPER_ADMIN_MANAGE: 'super_admin.manage',
} as const;

export type PermissionKey = (typeof Permissions)[keyof typeof Permissions];

// Role to default permissions mapping
export const RolePermissionsMap: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: Object.values(Permissions),
  ADMIN: [
    Permissions.CUSTOMERS_READ,
    Permissions.CUSTOMERS_UPDATE,
    Permissions.CUSTOMERS_APPROVE,
    Permissions.CUSTOMERS_SUSPEND,
    Permissions.BUSINESSES_READ,
    Permissions.BUSINESSES_UPDATE,
    Permissions.BUSINESSES_APPROVE,
    Permissions.BUSINESSES_SUSPEND,
    Permissions.CARDS_READ,
    Permissions.CARDS_ISSUE,
    Permissions.CARDS_ASSIGN,
    Permissions.CARDS_BLOCK,
    Permissions.CARDS_REPLACE,
    Permissions.POINTS_READ,
    Permissions.ORDERS_READ,
    Permissions.ORDERS_UPDATE,
    Permissions.ORDERS_CANCEL,
    Permissions.SERVICES_MANAGE,
    Permissions.OFFERS_APPROVE,
    Permissions.STORE_MANAGE,
    Permissions.CMS_MANAGE,
    Permissions.REPORTS_VIEW,
    Permissions.REPORTS_EXPORT,
    Permissions.AUDIT_READ,
    Permissions.JOBS_TRIGGER,
  ],
  BUSINESS: [
    Permissions.EMPLOYEES_MANAGE,
    Permissions.ORDERS_READ,
    Permissions.POINTS_READ,
  ],
  EMPLOYEE: [
    Permissions.POINTS_READ,
  ],
  CUSTOMER: [],
};

// API Standard Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}
