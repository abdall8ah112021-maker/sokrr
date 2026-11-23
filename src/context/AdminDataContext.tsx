import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

export interface PendingApprovalsData {
  customers: any[];
  businesses: any[];
  totalPending: number;
}

interface AdminDataContextType {
  metrics: any;
  businesses: any[];
  customers: any[];
  news: any[];
  cards: any[];
  systemSettings: any[];
  jobs: any[];
  auditLogs: any[];
  products: any[];
  orders: any[];
  services: any[];
  offers: any[];
  governorates: any[];
  cmsPages: any[];
  health: any;
  directoryConfig: any;
  discountServices: any[];
  discountPageConfig: any;
  pendingApprovals: PendingApprovalsData;
  refetchData: () => void;
  refetchApprovals: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const { data, refetch } = useQuery({
    queryKey: ['adminData', user?.id || 'anon'],
    enabled: isAdmin,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
    refetchInterval: isAdmin ? 15000 : false,
    queryFn: async () => {
      const [
        metrics, businesses, customers, cards, systemSettings,
        jobs, auditLogs, health, services, offers, governorates, news, cmsPages, products, orders, directoryConfig,
        discountServices, discountPageConfig
      ] = await Promise.all([
        api.getAdminMetrics(),
        api.getAllBusinesses(),
        api.getAdminCustomers(),
        api.getAllCards(),
        api.getAdminSettings(),
        api.getAdminJobs(),
        api.getAdminAuditLogs(),
        api.getHealth(),
        api.getServices(),
        api.getActiveOffers(),
        api.getGovernorates(),
        api.getNews(),
        api.getAllCMSPages(),
        api.getAdminProducts().catch(() => api.getProducts()),
        api.getAdminOrders().catch(() => []),
        api.getDirectoryConfig().catch(() => null),
        api.getAllDiscountServices().catch(() => []),
        api.getDiscountPageConfig().catch(() => null),
      ]);
      return {
        metrics, businesses, customers, cards, systemSettings, jobs, auditLogs, health,
        services, offers, governorates, news, cmsPages, products, orders, directoryConfig,
        discountServices, discountPageConfig
      };
    }
  });

  const approvalsQuery = useQuery<PendingApprovalsData>({
    queryKey: ['pendingApprovals', user?.id || 'anon'],
    enabled: isAdmin,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
    refetchInterval: isAdmin ? 2500 : false,
    queryFn: () => api.getPendingApprovals(),
  });

  const triggerApprovalsSync = useCallback(() => {
    if (!isAdmin) return;
    queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    queryClient.invalidateQueries({ queryKey: ['adminData'] });
    approvalsQuery.refetch();
    refetch();
  }, [isAdmin, queryClient, approvalsQuery, refetch]);

  useEffect(() => {
    if (!isAdmin || typeof window === 'undefined') return;

    const handleLocalUpdate = () => {
      triggerApprovalsSync();
    };
    window.addEventListener('sugar:approvals:updated', handleLocalUpdate);

    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('sugar_approvals');
        channel.onmessage = () => {
          triggerApprovalsSync();
        };
      } catch {
        // Ignore BroadcastChannel errors in restricted browsers
      }
    }

    return () => {
      window.removeEventListener('sugar:approvals:updated', handleLocalUpdate);
      if (channel) {
        try {
          channel.close();
        } catch {
          // Ignore close error
        }
      }
    };
  }, [isAdmin, triggerApprovalsSync]);

  const refetchApprovals = useCallback(() => {
    if (!isAdmin) return;
    approvalsQuery.refetch();
  }, [isAdmin, approvalsQuery]);

  const refetchData = useCallback(() => {
    if (!isAdmin) return;
    refetch();
    approvalsQuery.refetch();
  }, [isAdmin, refetch, approvalsQuery]);

  const pendingApprovals: PendingApprovalsData = approvalsQuery.data || {
    customers: [],
    businesses: [],
    totalPending: 0,
  };

  const value: AdminDataContextType = {
    metrics: data?.metrics || null,
    businesses: data?.businesses || [],
    customers: data?.customers || [],
    news: data?.news || [],
    cards: data?.cards || [],
    systemSettings: data?.systemSettings || [],
    jobs: data?.jobs || [],
    auditLogs: data?.auditLogs || [],
    products: data?.products || [],
    orders: data?.orders || [],
    services: data?.services || [],
    offers: data?.offers || [],
    governorates: data?.governorates || [],
    cmsPages: data?.cmsPages || [],
    health: data?.health || null,
    directoryConfig: data?.directoryConfig || null,
    discountServices: data?.discountServices || [],
    discountPageConfig: data?.discountPageConfig || null,
    pendingApprovals,
    refetchData,
    refetchApprovals,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within an AdminDataProvider');
  return context;
};
