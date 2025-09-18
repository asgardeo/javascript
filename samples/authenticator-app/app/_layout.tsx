import PushAuthProvider from "@/src/contexts/push-auth/push-auth-provider";
import { Stack } from "expo-router";
import { ReactElement } from "react";
import HomeHeader from "../src/components/home/header";
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
              headerTitle: HomeHeader
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
        </Stack>
      </PushAuthProvider>
    </ThemeProvider>
  );
}

export default RootLayout;
