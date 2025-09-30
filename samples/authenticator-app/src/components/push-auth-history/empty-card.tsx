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

import { StyleSheet, View, Text } from "react-native";
import { FunctionComponent } from "react";
import { Ionicons } from "@expo/vector-icons";

/**
 * Empty card component to display when no push authentication history is available.
 *
 * @returns A React element representing an empty state card.
 */
const EmptyCard: FunctionComponent = () => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <Ionicons name="notifications-off-outline" size={48} color="#868c99ff" />
        <Text style={styles.emptyTitle}>No Push Login History</Text>
        <Text style={styles.emptySubtitle}>
          You haven&apos;t received any push login requests yet. When you receive login requests
          that require push login, they will appear here with details about the application,
          device, and your response.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 32,
    backgroundColor: '#f5f6f9ff',
    borderColor: '#d1d9e6',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200
  },
  cardContent: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 280
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#56585eff',
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#868c99ff',
    textAlign: 'center',
    lineHeight: 20
  }
});

export default EmptyCard;
