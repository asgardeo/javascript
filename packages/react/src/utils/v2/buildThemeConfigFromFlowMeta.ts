/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
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

import {FlowMetaTheme, FlowMetaThemeColorScheme, RecursivePartial, ThemeConfig} from '@asgardeo/browser';

/**
 * Converts a v2 `FlowMetaTheme` into a `RecursivePartial<ThemeConfig>` that
 * `createTheme` can consume.
 *
 * Only fields explicitly present in the FlowMeta response are included so that
 * `createTheme` can deep-merge them onto its base (light/dark) defaults without
 * accidentally dropping sibling keys that were not returned by the server.
 *
 * For example, when FlowMeta returns only `background.default` and
 * `background.paper`, only `body.main` and `surface` are set — the base
 * theme's `background.disabled` and `background.dark` are **not** overridden
 * and therefore keep their default CSS variable values.
 */
const buildThemeConfigFromFlowMeta = (
  flowMetaTheme: FlowMetaTheme,
  colorScheme: 'light' | 'dark',
): RecursivePartial<ThemeConfig> => {
  const scheme: FlowMetaThemeColorScheme | undefined = flowMetaTheme.colorSchemes?.[colorScheme];
  const borderRadius: number | undefined = flowMetaTheme.shape?.borderRadius;
  const borderRadiusStr: string | undefined = borderRadius !== undefined ? `${borderRadius}px` : undefined;

  // Build only the colors that the server actually provided.
  // Each nested object is constructed incrementally so that absent fields are
  // simply omitted rather than set to `undefined`, which would shadow the
  // base-theme defaults inside `createTheme`.
  let colors: RecursivePartial<ThemeConfig['colors']> | undefined;

  if (scheme?.colors) {
    colors = {};

    if (scheme.colors.primary) {
      colors.primary = scheme.colors.primary;
    }
    if (scheme.colors.secondary) {
      colors.secondary = scheme.colors.secondary;
    }
    if (scheme.colors.text) {
      colors.text = scheme.colors.text;
    }

    // Build background incrementally to avoid replacing the full base object.
    if (scheme.colors.background) {
      const bg: RecursivePartial<ThemeConfig['colors']['background']> = {};

      if (scheme.colors.background.default) {
        bg.body = {main: scheme.colors.background.default};
      }
      if (scheme.colors.background.paper) {
        bg.surface = scheme.colors.background.paper;
      }

      if (Object.keys(bg).length > 0) {
        colors.background = bg;
      }
    }
  }

  return {
    ...(flowMetaTheme.direction ? {direction: flowMetaTheme.direction} : {}),
    ...(borderRadiusStr
      ? {
          borderRadius: {
            large: borderRadiusStr,
            medium: borderRadiusStr,
            small: borderRadiusStr,
          },
        }
      : {}),
    ...(colors && Object.keys(colors).length > 0 ? {colors} : {}),
    ...(flowMetaTheme.typography?.fontFamily ? {typography: {fontFamily: flowMetaTheme.typography.fontFamily}} : {}),
  };
};

export default buildThemeConfigFromFlowMeta;
