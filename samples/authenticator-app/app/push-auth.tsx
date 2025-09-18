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

import usePushAuth from "@/src/contexts/push-auth/use-push-auth";
import { PushAuthenticationDataInterface } from "@/src/models/push-notification";
import { Router, useLocalSearchParams, useRouter } from "expo-router";
import { FunctionComponent, ReactElement, useEffect, useMemo } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import AppNotification from "../src/components/push-auth/app-notification";
import useTheme from "../src/contexts/theme/useTheme";

/**
 * Push Authentication Screen
 *
 * @returns Push authentication screen component.
 */
const PushAuthScreen: FunctionComponent = (): ReactElement | null => {
  const { styles } = useTheme();
  const router: Router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPushAuthMessageFromCache } = usePushAuth();

  const data: PushAuthenticationDataInterface | undefined = useMemo(() => {
    return getPushAuthMessageFromCache(id);
  }, [id, getPushAuthMessageFromCache]);

  useEffect(() => {
    if (!data) {
      router.back();
    }
  }, [data, router]);

  if (!data) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.colors.backgroundBody, { flex: 1 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        <AppNotification {...data!} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default PushAuthScreen;
