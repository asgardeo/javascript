/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {FlowMetadataResponse, FlowMetaType, getFlowMetaV2} from '@asgardeo/browser';
import {FC, PropsWithChildren, ReactElement, RefObject, useCallback, useEffect, useRef, useState} from 'react';
import FlowMetaContext from './FlowMetaContext';
import useAsgardeo from '../Asgardeo/useAsgardeo';

export interface FlowMetaProviderProps {
  /**
   * When false the provider skips fetching and provides null meta.
   * @default true
   */
  enabled?: boolean;
}

/**
 * FlowMetaProvider fetches flow metadata from the `GET /flow/meta` endpoint
 * (v2 API) and makes it available to child components through `FlowMetaContext`.
 *
 * It is designed to be used in v2 embedded-flow scenarios and integrates with
 * `ThemeProvider` so that theme settings (colors, direction, typography, …)
 * from the server-side design configuration are applied automatically.
 *
 * @example
 * ```tsx
 * <FlowMetaProvider
 *   config={{
 *     baseUrl: 'https://localhost:8090',
 *     type: FlowMetaType.App,
 *     id: 'your-app-id',
 *   }}
 * >
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 * </FlowMetaProvider>
 * ```
 */
const FlowMetaProvider: FC<PropsWithChildren<FlowMetaProviderProps>> = ({
  children,
  enabled = true,
}: PropsWithChildren<FlowMetaProviderProps>): ReactElement => {
  const {baseUrl, applicationId} = useAsgardeo();

  const [meta, setMeta] = useState<FlowMetadataResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Track whether an initial fetch has been triggered so we don't double-fetch
  // when the component first mounts with a stable config reference.
  const hasFetchedRef: RefObject<boolean> = useRef<boolean>(false);

  const fetchFlowMeta: () => Promise<void> = useCallback(async (): Promise<void> => {
    if (!enabled) {
      setMeta(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: FlowMetadataResponse = await getFlowMetaV2({baseUrl, id: applicationId, type: FlowMetaType.App});
      setMeta(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, baseUrl, applicationId]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchFlowMeta();
      return;
    }
    // Re-fetch when config or enabled changes after the initial mount
    fetchFlowMeta();
  }, [fetchFlowMeta]);

  const value: any = {
    error,
    fetchFlowMeta,
    isLoading,
    meta,
  };

  return <FlowMetaContext.Provider value={value}>{children}</FlowMetaContext.Provider>;
};

export default FlowMetaProvider;
