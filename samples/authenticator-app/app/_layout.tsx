import AccountHeaderRight from "../src/components/account/account-header-right";
import PushAuthProvider from "../src/contexts/push-auth/push-auth-provider";
import { Stack } from "expo-router";
import { ReactElement } from "react";
import HeaderSettings from "../src/components/home/header-settings";
import HeaderTitle from "../src/components/home/header-title";
import ThemeProvider from "../src/contexts/theme/ThemeProvider";

const RootLayout = (): ReactElement => {

  return (
    <ThemeProvider>
      <PushAuthProvider>
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
              headerTitle: HeaderTitle,
              headerRight: HeaderSettings
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
              headerTitle: HeaderTitle,
              headerRight: (): ReactElement => <AccountHeaderRight params={route.params as Record<string, string>} />
            })}
          />
          <Stack.Screen
            name="push-auth-history"
            options={({ route }) => ({
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
