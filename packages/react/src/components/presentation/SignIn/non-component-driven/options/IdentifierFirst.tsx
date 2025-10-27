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
import {BaseSignInOptionProps} from './SignInOptionFactory';
import useTranslation from '../../../../../hooks/useTranslation';
import useFlow from '../../../../../contexts/Flow/useFlow';
import useTheme from '../../../../../contexts/Theme/useTheme';

/**
 * Identifier First Sign-In Option Component.
 * Handles identifier-first authentication flow (username first, then password).
 */
const IdentifierFirst: FC<BaseSignInOptionProps> = ({
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
    setTitle(t('identifier.first.title'));
    setSubtitle(t('identifier.first.subtitle'));
  }, [setTitle, setSubtitle, t]);

  return (
    <>
      {formFields.map(param => (
        <div key={param.param}>
          {createField({
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
            placeholder: t(`elements.fields.placeholder`, {
              field: (param.displayName || param.param).toLowerCase(),
            }),
          })}
        </div>
      ))}

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
        {t('identifier.first.submit.button')}
      </Button>
    </>
  );
};

export default IdentifierFirst;
