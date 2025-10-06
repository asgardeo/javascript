/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
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

import { FunctionComponent, PropsWithChildren, ReactElement, useCallback, useState } from "react";
import AsgardeoContext from "./asgardeo-context";
import AccountProvider from "../account/account-provider";
import Alert, { AlertProps, AlertType } from "../../components/common/alert";

/**
 * Asgardeo provider props interface.
 */
export interface AsgardeoProviderPropsInterface {
  /**
   * Flag to indicate whether the app is initialized or not.
   */
  isAppInitialized: boolean;
}

/**
 * Asgardeo provider component.
 *
 * @param props - Props containing the children components and provider input props.
 * @returns - Asgardeo provider wrapping the children components.
 */
const AsgardeoProvider: FunctionComponent<PropsWithChildren<AsgardeoProviderPropsInterface>> = ({
  isAppInitialized,
  children
}: PropsWithChildren<AsgardeoProviderPropsInterface>): ReactElement => {
  const [alertConfig, setAlertConfig] = useState<AlertProps>({
    visible: false,
    type: AlertType.INFO,
    title: "",
    message: ""
  });

  /**
   * Show alert with the given configuration.
   *
   * @param config - Alert configuration.
   */
  const showAlert = useCallback((config: Omit<AlertProps, 'visible'>): void => {
    setAlertConfig({
      ...config,
      visible: true
    });
  }, []);


  /**
   * Hide the alert.
   */
  const hideAlert = useCallback((): void => {
    setAlertConfig({
      visible: false,
      type: AlertType.INFO,
      title: "",
      message: ""
    });
  }, []);

  return (
    <AsgardeoContext.Provider value={{
      isAppInitialized,
      showAlert,
      hideAlert
    }}>
      <AccountProvider>
        {children}
      </AccountProvider>
      <Alert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryButtonText={alertConfig.primaryButtonText}
        secondaryButtonText={alertConfig.secondaryButtonText}
        onPrimaryPress={alertConfig.onPrimaryPress}
        onSecondaryPress={alertConfig.onSecondaryPress}
        autoDismissTimeout={alertConfig.autoDismissTimeout}
      />
    </AsgardeoContext.Provider>
  )
}

export default AsgardeoProvider;
