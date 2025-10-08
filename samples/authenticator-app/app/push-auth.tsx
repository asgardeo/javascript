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

import usePushAuth from "../src/contexts/push-auth/usePushAuth";
import { PushAuthenticationDataInterface } from "../src/models/push-notification";
import { Router, useLocalSearchParams, useRouter } from "expo-router";
import { FunctionComponent, ReactElement, useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppNotification from "../src/components/push-auth/AppNotification";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeConfigs } from "../src/models/ui";
import Theme from "../src/utils/Theme";

const theme: ThemeConfigs = Theme.getInstance().getConfigs();

/**
 * Push Authentication Screen
 *
 * @returns Push authentication screen component.
 */
const PushAuthScreen: FunctionComponent = (): ReactElement | null => {
  const router: Router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPushAuthMessageFromCache } = usePushAuth();
  const insets: EdgeInsets = useSafeAreaInsets();

  /**
   * Push authentication data retrieved from the cache.
   */
  const data: PushAuthenticationDataInterface | undefined = useMemo(() => {
    return getPushAuthMessageFromCache(id);
  }, [id, getPushAuthMessageFromCache]);

  /**
   * If there is no data, navigate back to the previous screen.
   */
  useEffect(() => {
    if (!data) {
      router.back();
    }
  }, [data, router]);

  if (!data) {
    return null;
  }

  return (
    <View style={[styles.container]}>
      <View style={[styles.scrollContainer, { marginTop: insets.top, marginBottom: insets.bottom }]}>
        <ScrollView
          contentContainerStyle={[styles.contentContainer]}
        >
          <AppNotification {...data!} />
        </ScrollView>
      </View>
    </View>
  );
}

/**
 * Styles for the push authentication screen.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.screen.background
  },
  scrollContainer: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  }
});

export default PushAuthScreen;
