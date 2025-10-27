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

import {EmbeddedSignInFlowAuthenticator, EmbeddedSignInFlowAuthenticatorParamType, FieldType} from '@asgardeo/browser';
import {FC, useEffect} from 'react';
import {createField} from '../../../../factories/FieldFactory';
import Button from '../../../../primitives/Button/Button';
import OtpField from '../../../../primitives/OtpField/OtpField';
import {BaseSignInOptionProps} from './SignInOptionFactory';
import useTranslation from '../../../../../hooks/useTranslation';
import useFlow from '../../../../../contexts/Flow/useFlow';
import useTheme from '../../../../../contexts/Theme/useTheme';

/**
 * SMS OTP Sign-In Option Component.
 * Handles SMS-based OTP authentication.
 */
const SmsOtp: FC<BaseSignInOptionProps> = ({
  authenticator,
  formValues,
  touchedFields,
  isLoading,
  onInputChange,
  onSubmit,
  inputClassName = '',
  buttonClassName = '',
  preferences,
}) => {
  const {theme} = useTheme();
  const {t} = useTranslation(preferences?.i18n);
  const {setTitle, setSubtitle} = useFlow();

  const formFields = authenticator.metadata?.params?.sort((a, b) => a.order - b.order) || [];

  useEffect(() => {
    setTitle(t('sms.otp.title'));
    setSubtitle(t('sms.otp.subtitle'));
  }, [setTitle, setSubtitle, t]);

  const hasOtpField = formFields.some(
    param => param.param.toLowerCase().includes('otp') || param.param.toLowerCase().includes('code'),
  );

  return (
    <>
      {formFields.map(param => {
        const isOtpParam = param.param.toLowerCase().includes('otp') || param.param.toLowerCase().includes('code');

        return (
          <div key={param.param}>
            {isOtpParam && hasOtpField ? (
              <OtpField
                length={6}
                value={formValues[param.param] || ''}
                onChange={event => onInputChange(param.param, event.target.value)}
                disabled={isLoading}
                className={inputClassName}
              />
            ) : (
              createField({
                name: param.param,
                type:
                  param.type === EmbeddedSignInFlowAuthenticatorParamType.String
                    ? param.confidential
                      ? FieldType.Password
                      : FieldType.Text
                    : FieldType.Text,
                label: param.displayName,
                required: authenticator.requiredParams.includes(param.param),
                value: formValues[param.param] || '',
                onChange: value => onInputChange(param.param, value),
                disabled: isLoading,
                className: inputClassName,
                touched: touchedFields[param.param] || false,
              })
            )}
          </div>
        );
      })}

      <Button
        fullWidth
        type="submit"
        color="primary"
        variant="solid"
        disabled={isLoading}
        loading={isLoading}
        className={buttonClassName}
        style={{marginBottom: `calc(${theme.vars.spacing.unit} * 2)`}}
      >
        {t('sms.otp.submit.button')}
      </Button>
    </>
  );
};

export default SmsOtp;
