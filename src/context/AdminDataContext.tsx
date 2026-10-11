import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

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
  services: any[];
  offers: any[];
  governorates: any[];
  cmsPages: any[];
  health: any;
  refetchData: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, refetch } = useQuery({
    queryKey: ['adminData'],
    queryFn: async () => {
      const [
        metrics, businesses, customers, cards, systemSettings, 
        jobs, auditLogs, health, services, offers, governorates, news, cmsPages, products
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
        api.getProducts()
      ]);
      return { metrics, businesses, customers, cards, systemSettings, jobs, auditLogs, health, services, offers, governorates, news, cmsPages, products };
    }
  });

  const value = {
    metrics: data?.metrics || null,
    businesses: data?.businesses || [],
    customers: data?.customers || [],
    news: data?.news || [],
    cards: data?.cards || [],
    systemSettings: data?.systemSettings || [],
    jobs: data?.jobs || [],
    auditLogs: data?.auditLogs || [],
    products: data?.products || [],
    services: data?.services || [],
    offers: data?.offers || [],
    governorates: data?.governorates || [],
    cmsPages: data?.cmsPages || [],
    health: data?.health || null,
    refetchData: refetch
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within an AdminDataProvider');
  return context;
};
