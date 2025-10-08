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

import { FunctionComponent, PropsWithChildren, ReactElement, useCallback, useEffect, useState } from "react";
import AsgardeoContext from "./asgardeo-context";
import AccountProvider from "../account/account-provider";
import Alert, { AlertProps, AlertType } from "../../components/common/alert";
import TOTPProvider from "../totp/totp-provider";
import PushAuthProvider from "../push-auth/push-auth-provider";
import verifyLocalAuthentication from "../../utils/local-authentication";
import { AppAuthenticationStatus } from "../../models/core";

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
  const [
    authenticationStatus,
    setAuthenticationStatus
  ] = useState<AppAuthenticationStatus>(AppAuthenticationStatus.PENDING);

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

  /**
   * Effect to verify local authentication on component mount.
   */
  useEffect(() => {
    if (authenticationStatus === AppAuthenticationStatus.PENDING) {
      verifyLocalAuthentication()
        .then((verified: boolean) => {
          if (verified) {
            setAuthenticationStatus(AppAuthenticationStatus.AUTHENTICATED);
          } else {
            setAuthenticationStatus(AppAuthenticationStatus.UNAUTHENTICATED);
            showAlert({
              type: AlertType.ERROR,
              title: "Authentication Failed",
              message: "Failed to authenticate the user. Please try again.",
              primaryButtonText: "Retry",
              onPrimaryPress: () => {
                setAuthenticationStatus(AppAuthenticationStatus.PENDING)
                hideAlert();
              }
            });
          }
        });
    }
  }, [authenticationStatus, showAlert, hideAlert]);

  return (
    <AsgardeoContext.Provider value={{
      isAppInitialized,
      showAlert,
      hideAlert
    }}>
      {
        authenticationStatus === AppAuthenticationStatus.AUTHENTICATED && (
          <AccountProvider>
            <TOTPProvider>
              <PushAuthProvider>
                {children}
              </PushAuthProvider>
            </TOTPProvider>
          </AccountProvider>
        )
      }
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
        icon={alertConfig.icon}
      />
    </AsgardeoContext.Provider>
  )
}

export default AsgardeoProvider;
