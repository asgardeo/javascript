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

import AccountHeaderRight from "../src/components/account/account-header-right";
import { Stack } from "expo-router";
import { ReactElement, useEffect, useState } from "react";
import HeaderSettings from "../src/components/home/header-settings";
import HeaderTitle from "../src/components/common/header-title";
import ThemeProvider from "../src/contexts/theme/ThemeProvider";
import { ThemeConfigs } from "../src/models/ui";
import { getThemeConfigs } from "../src/utils/ui-utils";
import AsgardeoProvider from "../src/contexts/asgardeo/asgardeo-provider";
import AppPaths from "../src/constants/paths";

const theme: ThemeConfigs = getThemeConfigs();

/**
 * Root Layout component.
 *
 * @returns Root Layout component.
 */
const RootLayout = (): ReactElement => {
  const [mounted, setMounted] = useState(false);

  /**
   * Sets the mounted state to true when the component is mounted.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AsgardeoProvider isAppInitialized={mounted}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen
            name={AppPaths.ROOT}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name={AppPaths.HOME}
            options={{
              headerStyle: { backgroundColor: theme.colors.header.background },
              headerTitle: HeaderTitle,
              headerRight: HeaderSettings
            }}
          />
          <Stack.Screen
            name={AppPaths.QR_SCANNER}
            options={{
              headerShown: false,
              presentation: "modal"
            }}
          />
          <Stack.Screen
            name={AppPaths.PUSH_AUTH}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name={AppPaths.ACCOUNT}
            options={({ route }) => ({
              headerStyle: { backgroundColor: theme.colors.header.background },
              headerTitle: HeaderTitle,
              headerRight: (): ReactElement => <AccountHeaderRight params={route.params as Record<string, string>} />
            })}
          />
          <Stack.Screen
            name={AppPaths.PUSH_AUTH_HISTORY}
            options={({ route }) => ({
              headerStyle: { backgroundColor: theme.colors.header.background },
              headerTitle: HeaderTitle,
              headerRight: (): ReactElement => <AccountHeaderRight params={route.params as Record<string, string>} />
            })}
          />
        </Stack>
      </ThemeProvider>
    </AsgardeoProvider>
  );
}

export default RootLayout;
