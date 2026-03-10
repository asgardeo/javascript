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

import {type ConsentPurposeDataV2 as ConsentPurposeData} from '@asgardeo/browser';
import {FC, ReactNode} from 'react';
import ConsentCheckboxList from './ConsentCheckboxList';
import Typography from '../primitives/Typography/Typography';

/**
 * Consent purpose structure as expected from the backend.
 * The `essential` and `optional` arrays contain the list of attribute names that fall under
 * each category for the given purpose.
 */
export interface ConsentPurpose {
  /** Optional human-readable description of the purpose */
  description?: string;
  /** Attributes that are always required and cannot be declined */
  essential?: string[];
  /** Attributes that the user can optionally decline */
  optional?: string[];
  /** Unique identifier for the purpose */
  purpose_id: string;
  /** Name of the purpose to display in the UI */
  purpose_name: string;
}

/**
 * Render props exposed by Consent when using the render-prop pattern.
 */
export interface ConsentRenderProps {
  /** Current form values - used to read optional checkbox state. */
  formValues: Record<string, string>;
  /** Callback invoked when a user toggles an optional attribute. */
  onInputChange: (name: string, value: string) => void;
  /** The resolved list of consent purposes parsed from `consentData`. */
  purposes: ConsentPurposeData[];
}

/**
 * Props for the Consent component.
 */
export interface ConsentProps {
  /**
   * Render-props callback. When provided, the default consent UI is replaced with
   * whatever JSX the callback returns. The parsed `purposes` list is injected so
   * consumers do not need to re-parse `consentData` themselves.
   *
   * @example
   * ```tsx
   * <Consent consentData={raw} formValues={formInputs} onInputChange={onChange} t={t}>
   *   {({ purposes, formValues, onInputChange, t }) => (
   *     <div>
   *       {purposes.map(p => <MyConsentSection key={p.purpose_id} purpose={p} />)}
   *     </div>
   *   )}
   * </Consent>
   * ```
   */
  children?: (props: ConsentRenderProps) => ReactNode;
  /**
   * The raw JSON string returned by the backend in `additionalData.consentPrompt`.
   */
  consentData?: string | ConsentPurpose[] | {purposes: ConsentPurpose[]};
  /**
   * Current form values - used to read optional checkbox state.
   */
  formValues: Record<string, string>;
  /**
   * Callback invoked when a user toggles an optional attribute.
   */
  onInputChange: (name: string, value: string) => void;
}

/**
 * Consent component renders the list of purposes and their associated attributes (essential and optional)
 * based on the data provided by the backend. It allows users to toggle optional attributes while essential
 * attributes are displayed as read-only.
 */
const Consent: FC<ConsentProps> = ({consentData, formValues, onInputChange, children}: ConsentProps) => {
  if (!consentData) return null;

  let purposes: ConsentPurpose[] = [];

  try {
    const parsed: ConsentPurposeData[] | {purposes: ConsentPurpose[]} =
      typeof consentData === 'string' ? JSON.parse(consentData) : consentData;

    purposes = Array.isArray(parsed) ? parsed : parsed.purposes || [];
  } catch (e) {
    // Failed to parse consent prompt data
    return null;
  }

  if (purposes.length === 0) return null;

  if (children) {
    return <>{children({formValues, onInputChange, purposes: purposes as ConsentPurposeData[]})}</>;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem'}}>
      {purposes.map((purpose: ConsentPurpose, purposeIndex: number) => (
        <div key={purpose.purpose_id || purposeIndex} style={{paddingBottom: '1rem'}}>
          {/* TODO: Uncomment when the backend supports multiple purposes for a application */}
          {/* <Typography variant="h6" fontWeight={600} gutterBottom color="inherit">
            {purpose.purpose_name}
          </Typography>
          <Typography variant="body2" color="inherit" style={{marginBottom: '1rem', opacity: 0.85}}>
            {purpose.description}
          </Typography> */}

          {purpose.essential && purpose.essential.length > 0 && (
            <div style={{marginTop: '0.5rem'}}>
              <Typography variant="subtitle2" fontWeight="bold">
                Essential Attributes
              </Typography>
              <ConsentCheckboxList
                variant="ESSENTIAL"
                purpose={purpose as ConsentPurposeData}
                formValues={formValues}
                onInputChange={onInputChange}
              />
            </div>
          )}

          {purpose.optional && purpose.optional.length > 0 && (
            <div style={{marginTop: '0.5rem'}}>
              <Typography variant="subtitle2" fontWeight="bold">
                Optional Attributes
              </Typography>
              <ConsentCheckboxList
                variant="OPTIONAL"
                purpose={purpose as ConsentPurposeData}
                formValues={formValues}
                onInputChange={onInputChange}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Consent;
