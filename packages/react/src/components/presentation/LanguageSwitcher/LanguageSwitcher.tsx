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

import {resolveLocaleDisplayName, resolveLocaleEmoji} from '@asgardeo/browser';
import {FC, ReactElement, ReactNode, useMemo} from 'react';
import BaseLanguageSwitcher, {LanguageOption, LanguageSwitcherRenderProps} from './BaseLanguageSwitcher';
import useFlowMeta from '../../../contexts/FlowMeta/useFlowMeta';
import useTranslation from '../../../hooks/useTranslation';

export type {LanguageOption, LanguageSwitcherRenderProps};

export interface LanguageSwitcherProps {
  /**
   * Render-props callback for fully custom UI.
   *
   * @example
   * ```tsx
   * <LanguageSwitcher>
   *   {({languages, currentLanguage, onLanguageChange, isLoading}) => (
   *     <select
   *       value={currentLanguage}
   *       disabled={isLoading}
   *       onChange={e => onLanguageChange(e.target.value)}
   *     >
   *       {languages.map(l => (
   *         <option key={l.code} value={l.code}>{l.emoji} {l.displayName}</option>
   *       ))}
   *     </select>
   *   )}
   * </LanguageSwitcher>
   * ```
   */
  children?: (props: LanguageSwitcherRenderProps) => ReactNode;
  /** Additional CSS class for the root element (default UI only) */
  className?: string;
}

/**
 * A v2 LanguageSwitcher component that reads available languages from `FlowMetaContext`
 * and switches both the UI language (via `I18nContext`) and the flow metadata translations
 * (by re-fetching `GET /flow/meta` with the new language).
 *
 * Must be rendered inside a `FlowMetaProvider`.
 *
 * @example
 * ```tsx
 * // Default dropdown UI
 * <LanguageSwitcher />
 *
 * // Custom UI with render props
 * <LanguageSwitcher>
 *   {({languages, currentLanguage, onLanguageChange}) => (
 *     <div>
 *       {languages.map(lang => (
 *         <button
 *           key={lang.code}
 *           onClick={() => onLanguageChange(lang.code)}
 *           style={{fontWeight: lang.code === currentLanguage ? 'bold' : 'normal'}}
 *         >
 *           {lang.emoji} {lang.displayName}
 *         </button>
 *       ))}
 *     </div>
 *   )}
 * </LanguageSwitcher>
 * ```
 */
const LanguageSwitcher: FC<LanguageSwitcherProps> = ({children, className}: LanguageSwitcherProps): ReactElement => {
  const {meta, switchLanguage, isLoading} = useFlowMeta();
  const {currentLanguage} = useTranslation();

  const availableLanguageCodes: string[] = meta?.i18n?.languages ?? [];

  const languages: LanguageOption[] = useMemo(
    () =>
      availableLanguageCodes.map((code: string) => ({
        code,
        displayName: resolveLocaleDisplayName(code, currentLanguage),
        emoji: resolveLocaleEmoji(code),
      })),
    [availableLanguageCodes, currentLanguage],
  );

  const handleLanguageChange = (language: string): void => {
    if (language !== currentLanguage) {
      switchLanguage(language);
    }
  };

  return (
    <BaseLanguageSwitcher
      currentLanguage={currentLanguage}
      isLoading={isLoading}
      languages={languages}
      onLanguageChange={handleLanguageChange}
      className={className}
    >
      {children}
    </BaseLanguageSwitcher>
  );
};

export default LanguageSwitcher;
