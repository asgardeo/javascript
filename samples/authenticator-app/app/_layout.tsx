import { Stack } from "expo-router";
import { ReactElement, useEffect } from "react";
import HomeHeader from "../src/components/home/header";
import ThemeProvider from "../src/contexts/theme/ThemeProvider";
import { initializeFirebase } from "../src/config/firebase-config";

const RootLayout = (): ReactElement => {
  useEffect(() => {
    // Initialize Firebase when the app starts
    const initializeApp = async () => {
      try {
        await initializeFirebase();
        console.log('Firebase initialized successfully in app layout');
      } catch (error) {
        console.error('Failed to initialize Firebase in app layout:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ThemeProvider>
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
      </Stack>
    </ThemeProvider>
  );
}

export default RootLayout;
