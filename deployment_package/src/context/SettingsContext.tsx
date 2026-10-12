import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  isMaintenanceMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  toggleMaintenanceMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'sugar_site_settings_v1';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { isMaintenanceMode: false };
    } catch {
      return { isMaintenanceMode: false };
    }
  });

  const toggleMaintenanceMode = () => {
    setSettings((prev) => {
      const updated = { ...prev, isMaintenanceMode: !prev.isMaintenanceMode };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, toggleMaintenanceMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
