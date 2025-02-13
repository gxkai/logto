import type { TenantInfo } from '@logto/schemas';
import { defaultManagementApi } from '@logto/schemas';
import { conditional, noop } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useCallback, useMemo, createContext, useState } from 'react';

import { isCloud } from '@/consts/cloud';
import { getUserTenantId } from '@/consts/tenants';

type Props = {
  children: ReactNode;
};

export type Tenants = {
  tenants?: TenantInfo[];
  isSettle: boolean;
  setTenants: (tenants: TenantInfo[]) => void;
  setIsSettle: (isSettle: boolean) => void;
  currentTenantId: string;
  navigate: (tenantId: string) => void;
};

const { tenantId, indicator } = defaultManagementApi.resource;
const initialTenants = conditional(!isCloud && [{ id: tenantId, indicator }]);

export const TenantsContext = createContext<Tenants>({
  tenants: initialTenants,
  setTenants: noop,
  isSettle: false,
  setIsSettle: noop,
  currentTenantId: '',
  navigate: noop,
});

const TenantsProvider = ({ children }: Props) => {
  const [tenants, setTenants] = useState(initialTenants);
  const [isSettle, setIsSettle] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState(getUserTenantId());

  const navigate = useCallback((tenantId: string) => {
    window.history.pushState({}, '', '/' + tenantId);
    setCurrentTenantId(tenantId);
  }, []);

  const memorizedContext = useMemo(
    () => ({ tenants, setTenants, isSettle, setIsSettle, currentTenantId, navigate }),
    [currentTenantId, isSettle, navigate, tenants]
  );

  return <TenantsContext.Provider value={memorizedContext}>{children}</TenantsContext.Provider>;
};

export default TenantsProvider;
