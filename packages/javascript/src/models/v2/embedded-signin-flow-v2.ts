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

import {EmbeddedFlowExecuteRequestConfig, EmbeddedFlowResponseType, EmbeddedFlowType} from '../embedded-flow';

export enum EmbeddedSignInFlowStatusV2 {
  Complete = 'COMPLETE',
  Incomplete = 'INCOMPLETE',
  Error = 'ERROR',
}

export enum EmbeddedSignInFlowTypeV2 {
  Redirection = 'REDIRECTION',
  View = 'VIEW',
}

/**
 * Response structure for the new Asgardeo V2 embedded sign-in flow.
 * @experimental
 */
export interface EmbeddedSignInFlowResponseV2 {
  flowId: string;
  flowStatus: EmbeddedSignInFlowStatusV2;
  type: EmbeddedSignInFlowTypeV2;
  data: {
    actions?: {
      type: EmbeddedFlowResponseType;
      id: string;
    }[];
    inputs?: {
      name: string;
      type: string;
      required: boolean;
    }[];
  };
}

/**
 * Response structure for the new Asgardeo V2 embedded sign-in flow when the flow is complete.
 * @experimental
 */
export interface EmbeddedSignInFlowCompleteResponse {
  redirect_uri: string;
}

/**
 * Request payload for initiating the new Asgardeo V2 embedded sign-in flow.
 * @experimental
 */
export type EmbeddedSignInFlowInitiateRequestV2 = {
  applicationId: string;
  flowType: EmbeddedFlowType;
};

/**
 * Request payload for executing steps in the new Asgardeo V2 embedded sign-in flow.
 * @experimental
 */
export interface EmbeddedSignInFlowRequestV2 extends Partial<EmbeddedSignInFlowInitiateRequestV2> {
  flowId?: string;
  actionId?: string;
  inputs?: Record<string, any>;
}

/**
 * Request config for executing the new Asgardeo V2 embedded sign-in flow.
 * @experimental
 */
export interface EmbeddedFlowExecuteRequestConfigV2<T = any> extends EmbeddedFlowExecuteRequestConfig<T> {
  sessionDataKey?: string;
}
