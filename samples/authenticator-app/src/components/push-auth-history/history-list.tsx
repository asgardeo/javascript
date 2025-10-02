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

import { useFocusEffect } from "expo-router";
import { PushAuthenticationDataStorageInterface, StorageDataInterface } from "../../models/storage";
import { FunctionComponent, useCallback, useState } from "react";
import AsyncStorageService from "../../utils/async-storage-service";
import StorageConstants from "../../constants/storage";
import TypeConvert from "../../utils/typer-convert";
import { ScrollView, StyleSheet, View, Text, ViewStyle } from "react-native";
import HistoryCard from "./history-card";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyCard from "./empty-card";

/**
 * Props for the PushAuthHistoryList component.
 */
export interface PushAuthHistoryListProps {
  /**
   * The unique identifier for the account.
   */
  id: string;
  /**
   * Style for the container.
   */
  style: ViewStyle;
}

/**
 * Push authentication history list component.
 *
 * @param props - Props for the PushAuthHistoryList component.
 * @returns A React element representing the push authentication history list.
 */
const HistoryList: FunctionComponent<PushAuthHistoryListProps> = ({ id, style }: PushAuthHistoryListProps) => {
  const [pushLoginHistory, setPushLoginHistory] = useState<PushAuthenticationDataStorageInterface[]>([]);
  const insets: EdgeInsets = useSafeAreaInsets();

  /**
   * Fetch push login history from storage when the component mounts or when the accountDetails changes.
   */
  useFocusEffect(
    useCallback(() => {
      if (!id) return;

      AsyncStorageService.getItem(StorageConstants.replaceAccountId(
        StorageConstants.PUSH_AUTHENTICATION_DATA, id))
        .then((storageData: string | null) => {
          if (!storageData) return;

          const storageDataList: StorageDataInterface[] = JSON.parse(storageData);
          if (!storageDataList || storageDataList.length === 0) return;

          setPushLoginHistory(storageDataList.map(
            item => TypeConvert.toPushAuthenticationDataStorageInterface(item)));
        });
    }, [id])
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={[styles.container]}>
        <View style={[styles.itemContainer, style]}>
          <View style={[styles.itemContainerHeader]}>
            <Text style={[styles.itemContainerHeaderText]}>Push Login History</Text>
          </View>
          {pushLoginHistory.length === 0 && (
            <EmptyCard />
          )}
          {pushLoginHistory.map((historyItem: PushAuthenticationDataStorageInterface, index: number) => (
            <HistoryCard key={index} {...historyItem} />
          ))}
        </View>
      </ScrollView>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    backgroundColor: "#fbfbfb",
  },
  itemContainer: {
    padding: 24,
    gap: 8
  },
  itemContainerHeader: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 4
  },
  itemContainerHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#56585eff"
  }
});

export default HistoryList;
