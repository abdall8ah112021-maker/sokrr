// Shared Frontend Types for Sugar Business

export type UserRole = 'CUSTOMER' | 'BUSINESS' | 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';

export type AccountStatus = 'PENDING' | 'REQUIRES_CHANGES' | 'ACTIVE' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type CardStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'EXPIRED';

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

export interface User {
  id: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: AccountStatus;
}

export interface Customer {
  id: string;
  userId: string;
  fullName: string;
  governorate: string;
  city: string;
  address?: string;
  referenceNumber: string;
  createdAt: string;
  rating?: number;
}

export interface Card {
  id: string;
  cardId: string;
  qrId: string;
  cardNumber: string;
  customerId: string;
  status: CardStatus;
  issueDate: string;
  expiryDate: string;
  lastScanAt?: string;
  notes?: string;
  designConfig?: {
    theme: string;
    showQr: boolean;
    cardNumberPosition: string;
  };
}

export interface PointAccount {
  id: string;
  customerId: string;
  balance: number;
  totalEarnedHistorical: number;
  currentLevelId: string;
  updatedAt: string;
}

export interface PointLedger {
  id: string;
  customerId: string;
  transactionId: string;
  type: PointLedgerType;
  points: number;
  balanceAfter: number;
  actorId: string;
  reason?: string;
  referenceId?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  userId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email?: string;
  governorate: string;
  city: string;
  address: string;
  type: string;
  sectorId: string;
  description: string;
  logoUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    website?: string;
    whatsapp?: string;
  };
  workingHours?: string;
  galleryImages?: string[];
  discountNote?: string;
  isListed: boolean;
  status: AccountStatus;
  ratingAvg: number;
  ratingCount: number;
}

export interface Employee {
  id: string;
  userId: string;
  businessId: string;
  name: string;
  phone: string;
  jobTitle: string;
  photoUrl?: string;
  notes?: string;
  isActive: boolean;
}

export interface Sector {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  count: number;
}

export interface Service {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  targetAudience: string;
  sectorId: string;
  isActive: boolean;
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  customerId: string;
  serviceId: string;
  businessId?: string;
  status: ServiceRequestStatus;
  customerNotes?: string;
  adminNotes?: string;
  cancellationReason?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  businessId: string;
  business?: Business;
  title: string;
  description: string;
  discount: number;
  discountType: DiscountType;
  startDate: string;
  endDate: string;
  status: OfferStatus;
  mainImage?: string;
  conditions?: string;
  rejectReason?: string;
  selectedServiceIds: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  paymentType: PaymentType;
  cashPrice: number;
  pointsPrice: number;
  discount: number;
  inventory: number;
  lowStockThreshold: number;
  status: ProductStatus;
  images: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPriceCash: number;
  unitPricePoints: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  paymentType: PaymentType;
  status: OrderStatus;
  subtotalCash: number;
  subtotalPoints: number;
  deliveryFee: number;
  totalCash: number;
  totalPoints: number;
  deliveryAddress: {
    title: string;
    recipient: string;
    phone: string;
    governorate: string;
    city: string;
    street: string;
    building?: string;
  };
  cancellationReason?: string;
  statusTimeline: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  items: OrderItem[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  isRead: boolean;
  isHidden: boolean;
  deepLink?: string;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  author: string;
  publishDate: string;
  views: number;
  likes: number;
  tags: string[];
  comments: Array<{
    id: string;
    userName: string;
    comment: string;
    isApproved: boolean;
    createdAt: string;
  }>;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId?: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  category: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'WAITING_REPLY' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: Array<{
    id: string;
    sender: 'CUSTOMER' | 'SUPPORT';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  available: boolean;
  deliveryFee: number;
}

export interface CMSPageItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDesc?: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
}

export interface DiscountService {
  id: string;
  title: string;
  governorateId: string;
  governorateName: string;
  imageUrl: string;
  galleryImages: string[];
  phone: string;
  whatsapp: string;
  subscriptionPrice: number;
  validityDate: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}
