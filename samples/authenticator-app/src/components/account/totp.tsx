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

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FunctionComponent, ReactElement, useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTheme from "../../contexts/theme/useTheme";
import CryptoService from "../../utils/crypto-service";

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
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate TOTP code
  const generateCode = useCallback(async () => {
    if (!id) return;

    try {
      setIsGenerating(true);
      const code = CryptoService.generateTOTP(id);
      setTotpCode(code);

      // Get remaining seconds for this period
      const remaining = CryptoService.getTOTPRemainingSeconds(id);
      setRemainingSeconds(remaining || 30);
    } catch (error) {
      console.error("Error generating TOTP:", error);
      Alert.alert("Error", "Failed to generate TOTP code");
    } finally {
      setIsGenerating(false);
    }
  }, [id]);

  // Copy code to clipboard
  const copyToClipboard = async () => {
    if (!totpCode) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        "Copy Code",
        `TOTP Code: ${totpCode}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Copy",
            onPress: () => {
              Alert.alert("Copied", "Code has been copied to clipboard");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy code");
    }
  };

  // Timer effect
  useEffect(() => {
    if (!id) return;

    // Initial generation
    generateCode();

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Generate new code when timer expires
          generateCode();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [id, generateCode]);

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
    <View style={[localStyles.container, styles.colors.backgroundSurface]}>
      {/* Circular TOTP Display with Timer */}
      <View style={localStyles.circularContainer}>
        {/* Timer Progress Ring */}
        <View style={localStyles.timerRingContainer}>
          <View
            style={[
              localStyles.timerRingBackground,
              { borderColor: styles.colors.backgroundSurfaceLight.backgroundColor }
            ]}
          />
          <View
            style={[
              localStyles.timerRingProgress,
              {
                borderColor: getTimerColor(),
                transform: [{ rotate: `${(1 - progress) * 360}deg` }]
              }
            ]}
          />
        </View>

        {/* TOTP Code Circle */}
        <TouchableOpacity
          style={[
            localStyles.codeCircle,
            styles.colors.backgroundPrimary,
            {
              shadowColor: styles.colors.textPrimary.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8
            }
          ]}
          onPress={copyToClipboard}
          disabled={isGenerating || !totpCode}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <Text style={[styles.typography.body2, styles.colors.textOnPrimary]}>
              Generating...
            </Text>
          ) : (
            <>
              <Text style={[localStyles.codeText, styles.colors.textOnPrimary]}>
                {totpCode ? totpCode.match(/.{1,3}/g)?.join(" ") : "------"}
              </Text>
              <Text style={[styles.typography.caption, styles.colors.textOnPrimary, { opacity: 0.8 }]}>
                Tap to copy
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Timer Text */}
        <View style={localStyles.timerContainer}>
          <Text
            style={[
              localStyles.timerText,
              { color: getTimerColor() }
            ]}
          >
            {remainingSeconds}s
          </Text>
        </View>
      </View>

      {/* Copy Button */}
      <TouchableOpacity
        style={[
          localStyles.copyButton,
          styles.buttons.secondaryButton,
          { opacity: totpCode && !isGenerating ? 1 : 0.5 }
        ]}
        onPress={copyToClipboard}
        disabled={isGenerating || !totpCode}
      >
        <Ionicons
          name="copy-outline"
          size={20}
          color={styles.buttons.secondaryButtonText.color}
        />
        <Text style={[styles.buttons.secondaryButtonText, { marginLeft: 8 }]}>
          Copy Code
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Local styles for component-specific styling
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  timerRingContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingBackground: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
  },
  timerRingProgress: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  codeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  timerContainer: {
    position: 'absolute',
    bottom: -30,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});

export default TOTPCode;
