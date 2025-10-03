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

import StorageConstants from "../../constants/storage";
import { AccountInterface, StorageDataInterface } from "../../models/storage";
import AsyncStorageService from "../../utils/async-storage-service";
import TypeConvert from "../../utils/typer-convert";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { setStringAsync } from 'expo-clipboard';
import React, { FunctionComponent, ReactElement, RefObject, useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../../contexts/theme/useTheme";
import CryptoService from "../../utils/crypto-service";
import Avatar from "../common/avatar";
import CircularProgress from "./circular-porgress-bar";
import { Router, useFocusEffect, useRouter } from "expo-router";
import HistoryList from "../push-auth-history/history-list";
import { getUsername } from "@/src/utils/ui-utils";

/**
 * Props for the TOTPCode component.
 */
export interface TOTPCodeProps {
  /**
   * Id of the registered account.
   */
  id?: string;
}

/**
 * TOTP Code Component.
 *
 * @param id The ID of the registered account.
 * @returns A React element representing the TOTP code component.
 */
const TOTPCode: FunctionComponent<TOTPCodeProps> = ({ id }: TOTPCodeProps): ReactElement => {
  const { styles } = useTheme();
  const [totpCode, setTotpCode] = useState<string>("");
  const [nextTOTPCode, setNextTOTPCode] = useState<string>("");
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const previousTimeRef: RefObject<number> = useRef<number>(Number.NEGATIVE_INFINITY);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [accountDetails, setAccountDetails] = useState<AccountInterface | null>(null);
  const insets: EdgeInsets = useSafeAreaInsets();
  const router: Router = useRouter();

  /**
   * Fetch account details from storage when the component mounts or when the id changes.
   */
  useFocusEffect(
    useCallback(() => {
      if (!id) return;

      AsyncStorageService.getListItemByItemKey(StorageConstants.ACCOUNTS_DATA, 'id', id)
        .then((storageData: StorageDataInterface[]) => {
          setAccountDetails(TypeConvert.toAccountInterface(storageData[0]));
        })
    }, [id])
  );

  const generateCode = useCallback(async () => {
    if (!id || !accountDetails) return;

    try {
      setIsGenerating(true);
      const code = CryptoService.generateTOTP(id, accountDetails.period!, accountDetails.algorithm!, accountDetails.digits!);
      setTotpCode(code);
      const nextCode = CryptoService.generateNextTOTP(id, accountDetails.period!, accountDetails.algorithm!, accountDetails.digits!);
      setNextTOTPCode(nextCode);
    } catch {
      // Show code generation error.
    } finally {
      setIsGenerating(false);
    }
  }, [id, accountDetails]);

  const copyToClipboard = async (next: boolean = false) => {
    if (!totpCode && !nextTOTPCode) return;

    await setStringAsync(next ? nextTOTPCode : totpCode);
  };

  useEffect(() => {
    if (!id || !accountDetails?.issuer) return;

    generateCode();

    const interval = setInterval(() => {
      try {
        const remaining = CryptoService.getTOTPRemainingSeconds(id, accountDetails?.period!, accountDetails?.algorithm!, accountDetails?.digits!);

        if (remaining > previousTimeRef.current) {
          generateCode();
        }

        setRemainingSeconds(remaining);
        previousTimeRef.current = remaining;
      } catch {
        // Ignore the error since the next TOTP will be generated in the next interval.
      }
    }, 10);

    return () => clearInterval(interval);
  }, [id, generateCode, accountDetails]);

  // Calculate timer properties
  const progress = remainingSeconds / 30;
  const isWarning = remainingSeconds <= 10;
  const isDanger = remainingSeconds <= 5;

  // Timer color based on remaining time
  const getTimerColor = () => {
    if (isDanger) return "#ef4444"; // red
    if (isWarning) return "#f59e0b"; // amber
    return "#10b981"; // green
  };

  if (!id) {
    return (
      <View style={[localStyles.container, styles.colors.backgroundSurface]}>
        <Text style={[styles.typography.body1, styles.colors.textSecondary]}>
          No account selected
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[
          { marginBottom: accountDetails?.deviceId && accountDetails?.issuer ? insets.bottom + 45 : undefined },
          styles.colors.backgroundBody
        ]}
      >
        <View style={[localStyles.container, styles.colors.backgroundBody]}>
          <View style={[localStyles.headerContainer]}>
            <Avatar
              name={getUsername(accountDetails?.username!) || accountDetails?.displayName}
              style={[localStyles.headerAvatar]}
            />
            <Text style={[localStyles.usernameText]}>
              {getUsername(accountDetails?.username!)}
            </Text>
            <View style={[localStyles.organizationContainer]}>
              <Octicons
                style={[localStyles.organizationText]}
                name="organization"
                size={14}
              />
              <Text style={[localStyles.organizationText]}>
                {accountDetails?.displayName}
              </Text>
            </View>
          </View>
          {
            !accountDetails?.issuer ? (
              <HistoryList id={id} style={{ padding: 0 }} />
            ) : (
              <View style={[localStyles.totpContainer]}>
                <CircularProgress
                  size={290}
                  strokeWidth={10}
                  progress={progress}
                  color={getTimerColor()}
                  backgroundColor="#e2e3e4ff"
                  gapAngle={30}
                >
                  <TouchableOpacity
                    style={[
                      localStyles.codeCircle,
                      styles.colors.backgroundNeutral
                    ]}
                    onPress={() => copyToClipboard()}
                    disabled={isGenerating || !totpCode}
                  >
                    {isGenerating ? (
                      <Text style={[styles.typography.body2]}>
                        Generating...
                      </Text>
                    ) : (
                      <>
                        <Text style={[localStyles.codeText]}>
                          {totpCode ? totpCode.match(/.{1,3}/g)?.join(" ") : "------"}
                        </Text>
                        <Text style={[localStyles.tapToCopyText]}>
                          Tap to copy
                        </Text>
                        <Ionicons
                          name="copy-outline"
                          size={26}
                          color='#00000066'
                        />
                      </>
                    )}
                  </TouchableOpacity>
                </CircularProgress>
                <View style={localStyles.timerContainer}>
                  <Text style={[localStyles.timerText, { color: getTimerColor() }]}>
                    {parseInt(remainingSeconds.toFixed(0))}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[localStyles.nextTokenButton]}
                  onPress={() => copyToClipboard(true)}
                  disabled={isGenerating || !nextTOTPCode}
                >
                  <Text style={[localStyles.nextTokenText]}>
                    Next Token :
                  </Text>
                  <Text style={[localStyles.nextTokenText]}>
                    {nextTOTPCode ? nextTOTPCode.match(/.{1,3}/g)?.join(" ") : "------"}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }
        </View>
      </ScrollView>
      <View
        style={[
          localStyles.pushLoginHistoryContainer,
          { height: !accountDetails?.deviceId || !accountDetails?.issuer ? insets.bottom : undefined }
        ]}
      >
        {
          accountDetails?.deviceId && accountDetails?.issuer && (
            <TouchableOpacity
              style={[localStyles.pushLoginHistoryButton, { marginBottom: insets.bottom }]}
              onPress={() => router.push(`/push-auth-history?id=${id}`)}
            >
              <View style={[localStyles.pushLoginHistoryContent]}>
                <Ionicons name='time-outline' size={30} color="#00000066" />
                <Text style={[localStyles.pushLoginHistoryButtonText]}>View Push Login History</Text>
              </View>
              <Ionicons name="chevron-forward" size={30} color="#00000066" />
            </TouchableOpacity>
          )
        }
      </View>
    </>
  );
};

// Local styles for component-specific styling
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 24
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32
  },
  headerAvatar: {
    overflow: 'hidden',
    borderRadius: 8
  },
  usernameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#56585eff'
  },
  organizationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: 5
  },
  organizationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#868c99ff'
  },
  totpContainer: {
    alignSelf: 'stretch',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  codeCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5
  },
  codeText: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
    color: '#000000de'
  },
  tapToCopyText: {
    color: '#00000066',
    fontSize: 16,
    marginBottom: 2
  },
  timerContainer: {
    position: 'absolute',
    top: 12,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700'
  },
  nextTokenText: {
    color: '#868c99ff',
    fontSize: 15,
    fontWeight: '600'
  },
  nextTokenButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 32,
    backgroundColor: '#f0f1f3ff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  pushLoginHistoryContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fbfbfb'
  },
  pushLoginHistoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pushLoginHistoryButton: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#e8e9ebff',
    width: '100%'
  },
  pushLoginHistoryButtonText: {
    color: '#00000066',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default TOTPCode;
