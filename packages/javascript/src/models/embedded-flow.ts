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

export enum EmbeddedFlowType {
  Authentication = 'AUTHENTICATION',
  Registration = 'REGISTRATION',
}

export interface EmbeddedFlowExecuteRequestPayload {
  actionId?: string;
  flowType: EmbeddedFlowType;
  inputs?: Record<string, any>;
}

export interface EmbeddedFlowExecuteResponse {
  data: EmbeddedSignUpFlowData;
  flowId: string;
  flowStatus: EmbeddedFlowStatus;
  type: EmbeddedFlowResponseType;
}

export enum EmbeddedFlowStatus {
  Complete = 'COMPLETE',
  Incomplete = 'INCOMPLETE',
}

export enum EmbeddedFlowResponseType {
  Redirection = 'REDIRECTION',
  View = 'VIEW',
}

export interface EmbeddedSignUpFlowData {
  components?: EmbeddedFlowComponent[];
  redirectURL?: string;
}

export interface EmbeddedFlowComponent {
  components: EmbeddedFlowComponent[];
  config: Record<string, any>;
  id: string;
  type: EmbeddedFlowComponentType;
  variant?: string;
}

export enum EmbeddedFlowComponentType {
  Button = 'BUTTON',
  Checkbox = 'CHECKBOX',
  Divider = 'DIVIDER',
  Form = 'FORM',
  Image = 'IMAGE',
  Input = 'INPUT',
  Radio = 'RADIO',
  Select = 'SELECT',
  Typography = 'TYPOGRAPHY',
}

export interface EmbeddedFlowExecuteRequestConfig<T = any> extends Partial<Request> {
  baseUrl?: string;
  payload?: T;
  url?: string;
}
