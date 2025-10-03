import AccountHeaderRight from "../src/components/account/account-header-right";
import PushAuthProvider from "../src/contexts/push-auth/push-auth-provider";
import { Stack } from "expo-router";
import { ReactElement, useEffect, useState } from "react";
import HeaderSettings from "../src/components/home/header-settings";
import HeaderTitle from "../src/components/home/header-title";
import ThemeProvider from "../src/contexts/theme/ThemeProvider";
import { ThemeConfigs } from "../src/models/ui";
import { getThemeConfigs } from "../src/utils/ui-utils";

const theme: ThemeConfigs = getThemeConfigs();

const RootLayout = (): ReactElement => {

  const [mounted, setMounted] = useState(false);

  /**
   * Sets the mounted state to true when the component is mounted.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider>
      <PushAuthProvider rootMounted={mounted}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="home"
            options={{
              headerStyle: { backgroundColor: theme.colors.header.background },
              headerTitle: HeaderTitle,
              //headerRight: HeaderSettings
            }}
          />
          <Stack.Screen
            name="qr-scanner"
            options={{
              headerShown: false,
              presentation: "modal"
            }}
          />
          <Stack.Screen
            name="push-auth"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="account"
            options={({ route }) => ({
              headerStyle: { backgroundColor: theme.colors.header.background },
              headerTitle: HeaderTitle,
              headerRight: (): ReactElement => <AccountHeaderRight params={route.params as Record<string, string>} />
            })}
          />
          <Stack.Screen
            name="push-auth-history"
            options={({ route }) => ({
              headerStyle: { backgroundColor: theme.colors.header.background },
              headerTitle: HeaderTitle,
              headerRight: (): ReactElement => <AccountHeaderRight params={route.params as Record<string, string>} />
            })}
          />
        </Stack>
      </PushAuthProvider>
    </ThemeProvider>
  );
}

export default RootLayout;
