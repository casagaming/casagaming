import React, { createContext, useContext, useState, useEffect } from 'react';
import { turso } from '../lib/turso';

interface StoreConfig {
  store_name: string;
  logo_url: string;
  hero_images: string[];
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  whatsapp_number: string;
}

interface ConfigContextType {
  config: StoreConfig | null;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const result = await turso.execute('SELECT * FROM store_config LIMIT 1');
        if (result.rows.length > 0) {
          const cols = result.columns;
          const row = result.rows[0] as any[];
          const obj: any = {};
          cols.forEach((col, i) => { obj[col] = row[i]; });
          setConfig(obj as StoreConfig);
        }
      } catch (error) {
        console.error('Error fetching store config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
