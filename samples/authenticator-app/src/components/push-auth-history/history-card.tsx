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
import { PushAuthenticationDataStorageInterface } from "../../models/storage";
import { FunctionComponent } from "react";
import { getTimeFromNow } from "../../utils/ui-utils";
import { Ionicons } from "@expo/vector-icons";
import { PushAuthResponseStatus } from "@/src/models/push-notification";

/**
 * History card component to display individual push authentication history items.
 *
 * @param props - Props for the HistoryCard component.
 * @returns A React element representing a history card.
 */
const HistoryCard: FunctionComponent<PushAuthenticationDataStorageInterface> = ({
  applicationName,
  ipAddress,
  deviceOS,
  browser,
  status,
  respondedTime
}: PushAuthenticationDataStorageInterface) => {
  return (
    <View style={styles.cardContainer}>
      <View style={[styles.cardHeader]}>
        <View style={[styles.cardHeaderContent]}>
          {status === PushAuthResponseStatus.APPROVED ? (
            <>
              <Text style={[styles.cardHeaderTitle, styles.success]}>Successful Login</Text>
              <Text style={styles.cardHeaderSubtitle}>{getTimeFromNow(respondedTime)}</Text>
            </>
          ) : (
            <>
              <Text style={[styles.cardHeaderTitle, styles.error]}>Denied Login</Text>
              <Text style={styles.cardHeaderSubtitle}>{getTimeFromNow(respondedTime)}</Text>
            </>
          )}
        </View>
        {status === PushAuthResponseStatus.APPROVED ? (
          <Ionicons name="checkmark-circle" size={38} color="#10b981" />
        ) : (
          <Ionicons name="close-circle" size={38} color="#ef4444" />
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={[styles.contentRow]}>
          <Text style={styles.contentMain}>Application:</Text>
          <Text style={styles.contentSub}>{applicationName}</Text>
        </View>
        <View style={[styles.contentRow]}>
          <Text style={styles.contentMain}>IP Address:</Text>
          <Text style={styles.contentSub}>{ipAddress}</Text>
        </View>
        <View style={[styles.contentRow]}>
          <Text style={styles.contentMain}>Browser:</Text>
          <Text style={styles.contentSub}>{browser}</Text>
        </View>
        <View style={[styles.contentRow]}>
          <Text style={styles.contentMain}>Operating System:</Text>
          <Text style={styles.contentSub}>{deviceOS}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    backgroundColor: '#f5f6f9ff',
    borderColor: '#d1d9e6',
    borderWidth: 1,
    borderRadius: 8,
    gap: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomColor: '#d1d9e6',
    borderBottomWidth: 1
  },
  cardHeaderContent: {
    gap: 2
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981'
  },
  success: {
    color: '#10b981'
  },
  error: {
    color: '#ef4444'
  },
  cardHeaderSubtitle: {
    fontSize: 13,
    color: '#868c99ff'
  },
  cardContent: {
    gap: 6
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  contentMain: {
    fontSize: 13,
    color: '#868c99ff'
  },
  contentSub: {
    fontSize: 13,
    color: '#56585eff'
  }
});

export default HistoryCard;
