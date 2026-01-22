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

import { FC, ReactNode, useMemo } from 'react';
import BaseAcceptInvite, {
    BaseAcceptInviteRenderProps,
    AcceptInviteFlowResponse,
} from './BaseAcceptInvite';

/**
 * Render props for AcceptInvite (re-exported for convenience).
 */
export type AcceptInviteRenderProps = BaseAcceptInviteRenderProps;

/**
 * Props for the AcceptInvite component.
 */
export interface AcceptInviteProps {
    /**
     * Base URL for the Thunder API server.
     * If not provided, will try to read from window location.
     */
    baseUrl?: string;

    /**
     * Flow ID from the invite link.
     * If not provided, will be extracted from URL query parameters.
     */
    flowId?: string;

    /**
     * Invite token from the invite link.
     * If not provided, will be extracted from URL query parameters.
     */
    inviteToken?: string;

    /**
     * Callback when the flow completes successfully.
     */
    onComplete?: () => void;

    /**
     * Callback when an error occurs.
     */
    onError?: (error: Error) => void;

    /**
     * Callback when the flow state changes.
     */
    onFlowChange?: (response: AcceptInviteFlowResponse) => void;

    /**
     * Callback to navigate to sign in page.
     */
    onGoToSignIn?: () => void;

    /**
     * Custom CSS class name.
     */
    className?: string;

    /**
     * Render props function for custom UI.
     * If not provided, default UI will be rendered by the SDK.
     */
    children?: (props: AcceptInviteRenderProps) => ReactNode;

    /**
     * Size variant for the component.
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * Theme variant for the component card.
     */
    variant?: 'outlined' | 'elevated';

    /**
     * Whether to show the title.
     */
    showTitle?: boolean;

    /**
     * Whether to show the subtitle.
     */
    showSubtitle?: boolean;
}

/**
 * Helper to extract query parameters from URL.
 */
const getUrlParams = (): { flowId?: string; inviteToken?: string } => {
    if (typeof window === 'undefined') {
        return {};
    }

    const params = new URLSearchParams(window.location.search);
    return {
        flowId: params.get('flowId') || undefined,
        inviteToken: params.get('inviteToken') || undefined,
    };
};

/**
 * AcceptInvite component for end-users to accept an invite and set their password.
 *
 * This component is designed for end users accessing the thunder-gate app via an invite link.
 * It automatically:
 * 1. Extracts flowId and inviteToken from URL query parameters
 * 2. Validates the invite token with the backend
 * 3. Displays the password form if token is valid
 * 4. Completes the accept invite when password is set
 *
 * @example
 * ```tsx
 * import { AcceptInvite } from '@asgardeo/react';
 *
 * // URL: /invite?flowId=xxx&inviteToken=yyy
 *
 * const AcceptInvitePage = () => {
 *   return (
 *     <AcceptInvite
 *       baseUrl="https://api.thunder.io"
 *       onComplete={() => navigate('/signin')}
 *       onError={(error) => console.error(error)}
 *     >
 *       {({ values, components, isLoading, isComplete, isValidatingToken, isTokenInvalid, error, handleInputChange, handleSubmit }) => (
 *         <div>
 *           {isValidatingToken && <p>Validating your invite...</p>}
 *           {isTokenInvalid && <p>Invalid or expired invite link</p>}
 *           {isComplete && <p>Registration complete! You can now sign in.</p>}
 *           {!isComplete && !isValidatingToken && !isTokenInvalid && (
 *             // Render password form based on components
 *           )}
 *         </div>
 *       )}
 *     </AcceptInvite>
 *   );
 * };
 * ```
 */
const AcceptInvite: FC<AcceptInviteProps> = ({
    baseUrl,
    flowId: flowIdProp,
    inviteToken: inviteTokenProp,
    onComplete,
    onError,
    onFlowChange,
    onGoToSignIn,
    className,
    children,
    size = 'medium',
    variant = 'outlined',
    showTitle = true,
    showSubtitle = true,
}) => {
    // Extract from URL if not provided as props
    const { flowId: urlFlowId, inviteToken: urlInviteToken } = useMemo(() => getUrlParams(), []);

    const flowId = flowIdProp || urlFlowId;
    const inviteToken = inviteTokenProp || urlInviteToken;

    // Determine base URL
    const apiBaseUrl = useMemo(() => {
        if (baseUrl) {
            return baseUrl;
        }
        // Try to construct from current location (assuming same origin)
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return '';
    }, [baseUrl]);

    /**
     * Submit flow step data.
     * Makes an unauthenticated request to /flow/execute endpoint.
     */
    const handleSubmit = async (payload: Record<string, any>): Promise<AcceptInviteFlowResponse> => {
        const response = await fetch(`${apiBaseUrl}/flow/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                ...payload,
                verbose: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${errorText}`);
        }

        return response.json();
    };

    return (
        <BaseAcceptInvite
            flowId={flowId}
            inviteToken={inviteToken}
            onSubmit={handleSubmit}
            onComplete={onComplete}
            onError={onError}
            onFlowChange={onFlowChange}
            onGoToSignIn={onGoToSignIn}
            className={className}
            size={size}
            variant={variant}
            showTitle={showTitle}
            showSubtitle={showSubtitle}
        >
            {children}
        </BaseAcceptInvite>
    );
};

export default AcceptInvite;
