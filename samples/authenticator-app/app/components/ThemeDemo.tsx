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

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/theme/useTheme';

// Simple layout styles for the demo
const demoStyles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  header: { paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1 },
  section: { borderRadius: 12, padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row' },
  flexWrap: { flexWrap: 'wrap' },
  justifyBetween: { justifyContent: 'space-between' },
  marginVertical8: { marginVertical: 8 },
  card: { borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardSmall: { padding: 12, borderRadius: 8 },
  cardLarge: { padding: 24, borderRadius: 16 },
});

/**
 * Theme demo component that showcases all available theme features.
 * Demonstrates colors, typography, buttons, inputs, cards, and layout utilities.
 * Includes interactive theme switching functionality.
 *
 * @returns React functional component demonstrating theme system
 */
export const ThemeDemo: React.FC = () => {
  const { toggleTheme, themeMode, styles } = useTheme();

  return (
    <ScrollView style={styles.layout.container}>
      <View style={styles.layout.content}>
        {/* Header */}
        <View style={styles.layout.header}>
          <Text style={styles.typography.h1}>Theme Demo</Text>
          <Text style={styles.typography.subtitle1}>
            Current theme: {themeMode}
          </Text>
          <TouchableOpacity
            style={styles.buttons.primaryButton}
            onPress={toggleTheme}
          >
            <Text style={styles.buttons.primaryButtonText}>
              Switch to {themeMode === 'LIGHT' ? 'Dark' : 'Light'} Theme
            </Text>
          </TouchableOpacity>
        </View>

        {/* Colors Demo */}
        <View style={styles.layout.section}>
          <Text style={styles.typography.h3}>Colors</Text>
          <View style={[styles.layout.row, styles.layout.flexWrap]}>
            <View style={[styles.colors.backgroundPrimary, { width: 50, height: 50, margin: 4, borderRadius: 8 }]} />
            <View style={[styles.colors.backgroundSecondary, { width: 50, height: 50, margin: 4, borderRadius: 8 }]} />
            <View style={[styles.colors.backgroundError, { width: 50, height: 50, margin: 4, borderRadius: 8 }]} />
            <View style={[styles.colors.backgroundWarning, { width: 50, height: 50, margin: 4, borderRadius: 8 }]} />
            <View style={[styles.colors.backgroundInfo, { width: 50, height: 50, margin: 4, borderRadius: 8 }]} />
          </View>
        </View>

        {/* Typography Demo */}
        <View style={styles.layout.section}>
          <Text style={styles.typography.h3}>Typography</Text>
          <Text style={styles.typography.h1}>Heading 1</Text>
          <Text style={styles.typography.h2}>Heading 2</Text>
          <Text style={styles.typography.h3}>Heading 3</Text>
          <Text style={styles.typography.body1}>Body 1: This is regular body text</Text>
          <Text style={styles.typography.body2}>Body 2: This is smaller body text</Text>
          <Text style={styles.typography.caption}>Caption text</Text>
        </View>

        {/* Buttons Demo */}
        <View style={styles.layout.section}>
          <Text style={styles.typography.h3}>Buttons</Text>
          <View style={styles.layout.marginVertical8}>
            <TouchableOpacity style={styles.buttons.primaryButton}>
              <Text style={styles.buttons.primaryButtonText}>Primary Button</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.layout.marginVertical8}>
            <TouchableOpacity style={styles.buttons.secondaryButton}>
              <Text style={styles.buttons.secondaryButtonText}>Secondary Button</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.layout.marginVertical8}>
            <TouchableOpacity style={styles.buttons.externalButton}>
              <Text style={styles.buttons.externalButtonText}>External Button</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.layout.marginVertical8}>
            <TouchableOpacity style={styles.buttons.outlineButton}>
              <Text style={styles.buttons.outlineButtonText}>Outline Button</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inputs Demo */}
        <View style={styles.layout.section}>
          <Text style={styles.typography.h3}>Inputs</Text>

          <View style={styles.inputs.inputContainer}>
            <Text style={styles.inputs.inputLabel}>Text Input</Text>
            <TextInput
              style={styles.inputs.input}
              placeholder="Enter some text..."
              placeholderTextColor={styles.colors.textSecondary.color}
            />
          </View>

          <View style={styles.inputs.inputContainer}>
            <Text style={styles.inputs.inputLabel}>Small Input</Text>
            <TextInput
              style={[styles.inputs.input, styles.inputs.inputSmall]}
              placeholder="Small input..."
              placeholderTextColor={styles.colors.textSecondary.color}
            />
          </View>

          <View style={styles.inputs.inputContainer}>
            <Text style={styles.inputs.inputLabel}>Large Input</Text>
            <TextInput
              style={[styles.inputs.input, styles.inputs.inputLarge]}
              placeholder="Large input..."
              placeholderTextColor={styles.colors.textSecondary.color}
            />
          </View>

          <View style={styles.inputs.inputContainer}>
            <Text style={styles.inputs.inputLabel}>Textarea</Text>
            <TextInput
              style={styles.inputs.textarea}
              placeholder="Enter multiple lines of text..."
              placeholderTextColor={styles.colors.textSecondary.color}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Cards Demo */}
        <View style={styles.layout.section}>
          <Text style={styles.typography.h3}>Cards & Layout</Text>

          <View style={styles.layout.card}>
            <Text style={styles.typography.h5}>Card Title</Text>
            <Text style={styles.typography.body2}>
              This is a card component with themed styling.
            </Text>
          </View>

          <View style={[styles.layout.card, styles.layout.cardSmall]}>
            <Text style={styles.typography.h6}>Small Card</Text>
            <Text style={styles.typography.body3}>Smaller padding and text.</Text>
          </View>

          <View style={[styles.layout.card, styles.layout.cardLarge]}>
            <Text style={styles.typography.h4}>Large Card</Text>
            <Text style={styles.typography.body1}>
              Larger padding and more prominent text styling.
            </Text>
          </View>
        </View>

        {/* Spacing Demo */}
        <View style={styles.layout.section}>
          <Text style={styles.typography.h3}>Spacing Utilities</Text>
          <View style={[styles.layout.row, styles.layout.justifyBetween]}>
            <View style={[styles.colors.backgroundPrimary, styles.layout.padding16, styles.layout.borderRadius8]}>
              <Text style={styles.typography.caption}>Padding 16</Text>
            </View>
            <View style={[styles.colors.backgroundSecondary, styles.layout.padding24, styles.layout.borderRadius12]}>
              <Text style={styles.typography.caption}>Padding 24</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
