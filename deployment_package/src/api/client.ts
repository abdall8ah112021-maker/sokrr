// Sugar Business API Client

const API_BASE = '/api/v1';

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem('sugar_access_token'),
    refreshToken: localStorage.getItem('sugar_refresh_token'),
  };
}

export function setStoredTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem('sugar_access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('sugar_refresh_token', refreshToken);
  }
}

export function clearStoredTokens() {
  localStorage.removeItem('sugar_access_token');
  localStorage.removeItem('sugar_refresh_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = getStoredTokens();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized token refresh attempt
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const { refreshToken } = getStoredTokens();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          setStoredTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
          // Retry original request with new token
          headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
          const retryRes = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
          const retryData = await retryRes.json();
          if (!retryData.success) {
            throw new ApiError(retryData.error?.message || 'حدث خطأ في استجابة الخادم', retryData.error?.code);
          }
          return retryData.data;
        }
      } catch {
        clearStoredTokens();
      }
    }
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || (json && json.success === false)) {
    const message = json?.error?.message || 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً';
    const code = json?.error?.code || `HTTP_${response.status}`;
    throw new ApiError(message, code, json?.error?.details);
  }

  return json?.data !== undefined ? json.data : json;
}

// API Methods
export const api = {
  // Auth
  login: (phone: string, password: string) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),
  registerCustomer: (data: any) =>
    apiRequest('/auth/register-customer', { method: 'POST', body: JSON.stringify(data) }),
  registerBusiness: (data: any) =>
    apiRequest('/auth/register-business', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),

  // Cards
  getMyCard: () => apiRequest('/cards/my-card'),
  getAllCards: () => apiRequest('/cards'),
  issueCard: (data: { customerId: string; notes?: string }) =>
    apiRequest('/cards/issue', { method: 'POST', body: JSON.stringify(data) }),
  resolveQr: (query: string) =>
    apiRequest('/cards/resolve-qr', { method: 'POST', body: JSON.stringify({ query }) }),
  updateCardStatus: (id: string, status: string, reason: string) =>
    apiRequest(`/cards/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, reason }) }),

  // Points
  getMyPoints: () => apiRequest('/points/my-points'),
  adjustPoints: (customerId: string, points: number, reason: string) =>
    apiRequest('/points/adjust', { method: 'POST', body: JSON.stringify({ customerId, points, reason }) }),

  // Transactions / Scan
  createPurchase: (cardId: string, amount: number, idempotencyKey: string) =>
    apiRequest('/transactions/purchase', { method: 'POST', body: JSON.stringify({ cardId, amount, idempotencyKey }) }),

  // Businesses
  getDirectory: () => apiRequest('/businesses/directory'),
  getBusiness: (id: string) => apiRequest(`/businesses/${id}`),
  toggleFollowBusiness: (businessId: string) => apiRequest(`/businesses/${businessId}/follow`, { method: 'POST' }),
  getMyFollowing: () => apiRequest('/customer/following'),
  getAllBusinesses: () => apiRequest('/businesses'),
  updateBusinessStatus: (id: string, status: string, isListed?: boolean, reason?: string) =>
    apiRequest(`/businesses/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, isListed, reason }) }),

  // Employees
  getMyEmployees: () => apiRequest('/employees/my-business'),
  createEmployee: (data: any) =>
    apiRequest('/employees', { method: 'POST', body: JSON.stringify(data) }),

  // Services
  getSectors: () => apiRequest('/services/sectors'),
  getServices: (sectorId?: string) =>
    apiRequest(`/services${sectorId ? `?sectorId=${sectorId}` : ''}`),
  getService: (id: string) => apiRequest(`/services/${id}`),
  requestService: (data: { serviceId: string; customerNotes?: string }) =>
    apiRequest('/services/requests', { method: 'POST', body: JSON.stringify(data) }),
  getMyServiceRequests: () => apiRequest('/services/requests/my-requests'),

  // Offers
  getActiveOffers: () => apiRequest('/offers/active'),
  createOffer: (data: any) =>
    apiRequest('/offers', { method: 'POST', body: JSON.stringify(data) }),
  updateOfferStatus: (id: string, status: string, rejectReason?: string) =>
    apiRequest(`/offers/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, rejectReason }) }),

  // Store & Orders
  getProducts: (filter?: { paymentType?: string; categoryId?: string }) => {
    const params = new URLSearchParams();
    if (filter?.paymentType) params.append('paymentType', filter.paymentType);
    if (filter?.categoryId) params.append('categoryId', filter.categoryId);
    return apiRequest(`/store/products?${params.toString()}`);
  },
  getProduct: (id: string) => apiRequest(`/store/products/${id}`),
  getCategories: () => apiRequest('/store/categories'),
  createOrder: (data: any) =>
    apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => apiRequest('/orders/my-orders'),
  getOrder: (id: string) => apiRequest(`/orders/${id}`),
  cancelOrder: (id: string, reason?: string) =>
    apiRequest(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/mark-all-read', { method: 'POST' }),
  hideNotification: (id: string) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),

  // News, FAQ, Support, CMS
  getNews: () => apiRequest('/news'),
  getNewsArticle: (id: string) => apiRequest(`/news/${id}`),
  createNews: (data: any) => apiRequest('/admin/news', { method: 'POST', body: JSON.stringify(data) }),
  addNewsComment: (id: string, comment: string) =>
    apiRequest(`/news/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment }) }),
  getFAQs: () => apiRequest('/faqs'),
  getSupportTickets: () => apiRequest('/support/tickets'),
  createSupportTicket: (data: any) =>
    apiRequest('/support/tickets', { method: 'POST', body: JSON.stringify(data) }),
  addSupportMessage: (ticketId: string, message: string) =>
    apiRequest(`/support/tickets/${ticketId}/messages`, { method: 'POST', body: JSON.stringify({ message }) }),
  getCMSPage: (slug: string) => apiRequest(`/cms/${slug}`),
  getAllCMSPages: () => apiRequest('/cms/pages'),
  updateCMSPage: (slug: string, data: { title: string; content: string; metaTitle?: string; metaDesc?: string; status?: string }) =>
    apiRequest(`/admin/cms/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  getGovernorates: () => apiRequest('/governorates'),
  getDiscountServices: (governorateId?: string) => apiRequest(`/discount-services${governorateId ? `?governorateId=${governorateId}` : ''}`),
  getAllDiscountServices: () => apiRequest('/admin/discount-services'),
  createDiscountService: (data: any) => apiRequest('/admin/discount-services', { method: 'POST', body: JSON.stringify(data) }),
  updateDiscountService: (id: string, data: any) => apiRequest(`/admin/discount-services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDiscountService: (id: string) => apiRequest(`/admin/discount-services/${id}`, { method: 'DELETE' }),
  adminCreateProduct: (data: any) => apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateProduct: (id: string, data: any) => apiRequest(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteProduct: (id: string) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  adminCreateGovernorate: (data: any) => apiRequest('/admin/governorates', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateGovernorate: (id: string, data: any) => apiRequest(`/admin/governorates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteGovernorate: (id: string) => apiRequest(`/admin/governorates/${id}`, { method: 'DELETE' }),
  adminCreateBusiness: (data: any) => apiRequest('/admin/businesses', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateBusiness: (id: string, data: any) => apiRequest(`/admin/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteBusiness: (id: string) => apiRequest(`/admin/businesses/${id}`, { method: 'DELETE' }),
  adminCreateCard: (data: any) => apiRequest('/admin/cards', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCard: (id: string, data: any) => apiRequest(`/admin/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCard: (id: string) => apiRequest(`/admin/cards/${id}`, { method: 'DELETE' }),
  adminCreateService: (data: any) => apiRequest('/admin/services', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateService: (id: string, data: any) => apiRequest(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteService: (id: string) => apiRequest(`/admin/services/${id}`, { method: 'DELETE' }),
  adminCreateOffer: (data: any) => apiRequest('/admin/offers', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateOffer: (id: string, data: any) => apiRequest(`/admin/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteOffer: (id: string) => apiRequest(`/admin/offers/${id}`, { method: 'DELETE' }),
  adminCreateNotification: (data: any) => apiRequest('/admin/notifications', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateNotification: (id: string, data: any) => apiRequest(`/admin/notifications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteNotification: (id: string) => apiRequest(`/admin/notifications/${id}`, { method: 'DELETE' }),
  adminCreateNews: (data: any) => apiRequest('/admin/news', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateNews: (id: string, data: any) => apiRequest(`/admin/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteNews: (id: string) => apiRequest(`/admin/news/${id}`, { method: 'DELETE' }),

  // Admin
  getAdminMetrics: () => apiRequest('/admin/metrics'),
  getAdminCustomers: () => apiRequest('/admin/customers'),
  updateCustomerStatus: (userId: string, status: string, reason?: string) =>
    apiRequest(`/admin/customers/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status, reason }) }),
  deleteCustomer: (userId: string) =>
    apiRequest(`/admin/customers/${userId}`, { method: 'DELETE' }),
  getAdminAuditLogs: () => apiRequest('/admin/audit-logs'),
  getAdminSettings: () => apiRequest('/admin/settings'),
  updateAdminSetting: (key: string, value: string) =>
    apiRequest(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  getAdminJobs: () => apiRequest('/admin/jobs'),
  runAdminJob: (id: string) => apiRequest(`/admin/jobs/${id}/run`, { method: 'POST' }),
  getHealth: () => apiRequest('/health'),
};
