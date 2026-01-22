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

import { FC, ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { cx } from '@emotion/css';
import { renderInviteUserComponents } from '../../AuthOptionFactory';
import { normalizeFlowResponse, extractErrorMessage } from '../../../../../utils/v2/flowTransformer';
import useTranslation from '../../../../../hooks/useTranslation';
import useTheme from '../../../../../contexts/Theme/useTheme';
import useStyles from './BaseAcceptInvite.styles';
import Card, { CardProps } from '../../../../primitives/Card/Card';
import Typography from '../../../../primitives/Typography/Typography';
import Alert from '../../../../primitives/Alert/Alert';
import Spinner from '../../../../primitives/Spinner/Spinner';
import Button from '../../../../primitives/Button/Button';

/**
 * Flow response structure from the backend.
 */
export interface AcceptInviteFlowResponse {
    flowId: string;
    flowStatus: 'INCOMPLETE' | 'COMPLETE' | 'ERROR';
    type?: 'VIEW' | 'REDIRECTION';
    data?: {
        components?: any[];
        meta?: {
            components?: any[];
        };
        additionalData?: Record<string, string>;
    };
    failureReason?: string;
}

/**
 * Render props for custom UI rendering of AcceptInvite.
 */
export interface BaseAcceptInviteRenderProps {
    /**
     * Form values for the current step.
     */
    values: Record<string, string>;

    /**
     * Field validation errors.
     */
    fieldErrors: Record<string, string>;

    /**
     * API error (if any).
     */
    error?: Error | null;

    /**
     * Touched fields.
     */
    touched: Record<string, boolean>;

    /**
     * Loading state.
     */
    isLoading: boolean;

    /**
     * Flow components from the current step.
     */
    components: any[];

    /**
     * Current flow ID from URL.
     */
    flowId?: string;

    /**
     * Invite token from URL.
     */
    inviteToken?: string;

    /**
     * Function to handle input changes.
     */
    handleInputChange: (name: string, value: string) => void;

    /**
     * Function to handle input blur.
     */
    handleInputBlur: (name: string) => void;

    /**
     * Function to handle form submission.
     */
    handleSubmit: (component: any, data?: Record<string, any>) => Promise<void>;

    /**
     * Whether the flow has completed successfully.
     */
    isComplete: boolean;

    /**
     * Whether the invite token is being validated.
     */
    isValidatingToken: boolean;

    /**
     * Whether the token validation failed.
     */
    isTokenInvalid: boolean;

    /**
     * Title for the current step.
     */
    title?: string;

    /**
     * Subtitle for the current step.
     */
    subtitle?: string;

    /**
     * Whether the form is valid.
     */
    isValid: boolean;

    /**
     * Navigate to sign in page.
     */
    goToSignIn?: () => void;

    /**
     * Title from the password screen (for use in completion screen).
     */
    completionTitle?: string;
}

/**
 * Props for the BaseAcceptInvite component.
 */
export interface BaseAcceptInviteProps {
    /**
     * Flow ID from the invite link URL.
     */
    flowId?: string;

    /**
     * Invite token from the invite link URL.
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
     * Function to submit flow step data.
     * This makes a request to the flow/execute endpoint.
     */
    onSubmit: (payload: Record<string, any>) => Promise<AcceptInviteFlowResponse>;

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
     * If not provided, default UI will be rendered.
     */
    children?: (props: BaseAcceptInviteRenderProps) => ReactNode;

    /**
     * Size variant for the component.
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * Theme variant for the component.
     */
    variant?: CardProps['variant'];

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
 * Base component for accept invite flow (end-user).
 * Handles the flow logic for validating an invite token and setting a password.
 *
 * When no children are provided, renders a default UI with:
 * - Loading spinner during token validation
 * - Error alerts for invalid/expired tokens
 * - Password form with validation
 * - Success state with sign-in redirect
 *
 * Flow steps handled:
 * 1. Validate invite token (automatic on mount)
 * 2. Password input
 * 3. Flow completion
 */
const BaseAcceptInvite: FC<BaseAcceptInviteProps> = ({
    flowId,
    inviteToken,
    onSubmit,
    onComplete,
    onError,
    onFlowChange,
    onGoToSignIn,
    className = '',
    children,
    size = 'medium',
    variant = 'outlined',
    showTitle = true,
    showSubtitle = true,
}) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const styles = useStyles(theme, theme.vars.colors.text.primary);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [isTokenInvalid, setIsTokenInvalid] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [currentFlow, setCurrentFlow] = useState<AcceptInviteFlowResponse | null>(null);
    const [apiError, setApiError] = useState<Error | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const [isFormValid, setIsFormValid] = useState(true);
    const [completionTitle, setCompletionTitle] = useState<string | undefined>(undefined);

    const tokenValidationAttemptedRef = useRef(false);

    /**
     * Handle error responses and extract meaningful error messages.
     * Uses the transformer's extractErrorMessage function for consistency.
     */
    const handleError = useCallback(
        (error: any) => {
            // Extract error message from response failureReason or use extractErrorMessage
            const errorMessage: string = error?.failureReason || extractErrorMessage(error, t, 'components.acceptInvite.errors.generic');

            // Set the API error state
            setApiError(error instanceof Error ? error : new Error(errorMessage));

            // Call the onError callback if provided
            onError?.(error instanceof Error ? error : new Error(errorMessage));
        },
        [t, onError],
    );

    /**
     * Normalize flow response to ensure component-driven format.
     * Transforms data.meta.components to data.components.
     */
    const normalizeFlowResponseLocal = useCallback(
        (response: AcceptInviteFlowResponse): AcceptInviteFlowResponse => {
            if (!response?.data?.meta?.components) {
                return response;
            }

            try {
                const { components } = normalizeFlowResponse(response, t, {
                    defaultErrorKey: 'components.acceptInvite.errors.generic',
                    resolveTranslations: !children,
                });

                return {
                    ...response,
                    data: {
                        ...response.data,
                        components: components as any,
                    },
                };
            } catch {
                // If transformer throws (e.g., error response), return as-is
                return response;
            }
        },
        [t, children],
    );

    /**
     * Handle input value changes.
     */
    const handleInputChange = useCallback((name: string, value: string) => {
        setFormValues(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }, []);

    /**
     * Handle input blur.
     */
    const handleInputBlur = useCallback((name: string) => {
        setTouchedFields(prev => ({ ...prev, [name]: true }));
    }, []);

    /**
     * Validate required fields based on components.
     */
    const validateForm = useCallback(
        (components: any[]): { isValid: boolean; errors: Record<string, string> } => {
            const errors: Record<string, string> = {};

            const validateComponents = (comps: any[]) => {
                comps.forEach(comp => {
                    if (
                        (comp.type === 'PASSWORD_INPUT' || comp.type === 'TEXT_INPUT' || comp.type === 'EMAIL_INPUT') &&
                        comp.required &&
                        comp.ref
                    ) {
                        const value = formValues[comp.ref];
                        if (!value || value.trim() === '') {
                            errors[comp.ref] = `${comp.label || comp.ref} is required`;
                        }
                    }
                    if (comp.components && Array.isArray(comp.components)) {
                        validateComponents(comp.components);
                    }
                });
            };

            validateComponents(components);

            return { isValid: Object.keys(errors).length === 0, errors };
        },
        [formValues],
    );

    /**
     * Handle form submission.
     */
    const handleSubmit = useCallback(
        async (component: any, data?: Record<string, any>) => {
            if (!currentFlow) {
                return;
            }

            // Validate form before submission
            const components = currentFlow.data?.components || [];
            const validation = validateForm(components);

            if (!validation.isValid) {
                setFormErrors(validation.errors);
                setIsFormValid(false);
                // Mark all fields as touched
                const touched: Record<string, boolean> = {};
                Object.keys(validation.errors).forEach(key => {
                    touched[key] = true;
                });
                setTouchedFields(prev => ({ ...prev, ...touched }));
                return;
            }

            setIsLoading(true);
            setApiError(null);
            setIsFormValid(true);

            try {
                // Build payload with form values
                const inputs = data || formValues;

                const payload: Record<string, any> = {
                    flowId: currentFlow.flowId,
                    inputs,
                    verbose: true,
                };

                // Add action ID if component has one
                if (component?.id) {
                    payload['action'] = component.id;
                }

                const rawResponse = await onSubmit(payload);
                const response = normalizeFlowResponseLocal(rawResponse);
                onFlowChange?.(response);

                // Store the heading from current flow before completion
                if (currentFlow?.data?.components || currentFlow?.data?.meta?.components) {
                    const currentComponents = currentFlow.data.components || currentFlow.data.meta?.components || [];
                    const heading = currentComponents.find(
                        (comp: any) => comp.type === 'TEXT' && comp.variant === 'HEADING_1'
                    );
                    if (heading?.label) {
                        setCompletionTitle(heading.label);
                    }
                }

                // Check for completion
                if (response.flowStatus === 'COMPLETE') {
                    setIsComplete(true);
                    onComplete?.();
                    return;
                }

                // Check for error status
                if (response.flowStatus === 'ERROR') {
                    handleError(response);
                    return;
                }

                // Update current flow and reset form for next step
                setCurrentFlow(response);
                setFormValues({});
                setFormErrors({});
                setTouchedFields({});
            } catch (err) {
                handleError(err);
            } finally {
                setIsLoading(false);
            }
        },
        [currentFlow, formValues, validateForm, onSubmit, onFlowChange, onComplete, handleError, normalizeFlowResponseLocal],
    );

    /**
     * Validate invite token on component mount.
     */
    useEffect(() => {
        if (!flowId || !inviteToken || tokenValidationAttemptedRef.current) {
            if (!flowId || !inviteToken) {
                setIsValidatingToken(false);
                setIsTokenInvalid(true);
                handleError(new Error('Invalid invite link. Missing flowId or inviteToken.'));
            }
            return;
        }

        tokenValidationAttemptedRef.current = true;

        (async () => {
            setIsValidatingToken(true);
            setApiError(null);

            try {
                // Send the invite token to validate and continue the flow
                const payload = {
                    flowId,
                    inputs: {
                        inviteToken,
                    },
                    verbose: true,
                };

                const rawResponse = await onSubmit(payload);
                const response = normalizeFlowResponseLocal(rawResponse);
                onFlowChange?.(response);

                // Check for error (invalid token)
                if (response.flowStatus === 'ERROR') {
                    setIsTokenInvalid(true);
                    handleError(response);
                    return;
                }

                // Token is valid, show the password form
                setCurrentFlow(response);
            } catch (err) {
                setIsTokenInvalid(true);
                handleError(err);
            } finally {
                setIsValidatingToken(false);
            }
        })();
    }, [flowId, inviteToken, onSubmit, onFlowChange, handleError, normalizeFlowResponseLocal]);

    /**
     * Extract title and subtitle from components.
     */
    const extractHeadings = useCallback((components: any[]): { title?: string; subtitle?: string } => {
        let title: string | undefined;
        let subtitle: string | undefined;

        components.forEach(comp => {
            if (comp.type === 'TEXT') {
                if (comp.variant === 'HEADING_1' && !title) {
                    title = comp.label;
                } else if ((comp.variant === 'HEADING_2' || comp.variant === 'SUBTITLE_1') && !subtitle) {
                    subtitle = comp.label;
                }
            }
        });

        return { title, subtitle };
    }, []);

    /**
     * Filter out heading components for default rendering.
     */
    const filterHeadings = useCallback((components: any[]): any[] => {
        return components.filter(
            comp => !(comp.type === 'TEXT' && (comp.variant === 'HEADING_1' || comp.variant === 'HEADING_2')),
        );
    }, []);

    /**
     * Render form components using the factory.
     */
    const renderComponents = useCallback(
        (components: any[]): ReactElement[] =>
            renderInviteUserComponents(components, formValues, touchedFields, formErrors, isLoading, isFormValid, handleInputChange, {
                onInputBlur: handleInputBlur,
                onSubmit: handleSubmit,
                size,
                variant,
            }),
        [formValues, touchedFields, formErrors, isLoading, isFormValid, handleInputChange, handleInputBlur, handleSubmit, size, variant],
    );

    // Get components from normalized response, with fallback to meta.components
    const components = currentFlow?.data?.components || currentFlow?.data?.meta?.components || [];
    const { title, subtitle } = extractHeadings(components);
    const componentsWithoutHeadings = filterHeadings(components);

    // Render props
    const renderProps: BaseAcceptInviteRenderProps = {
        values: formValues,
        fieldErrors: formErrors,
        error: apiError,
        touched: touchedFields,
        isLoading,
        components,
        flowId,
        inviteToken,
        handleInputChange,
        handleInputBlur,
        handleSubmit,
        isComplete,
        isValidatingToken,
        isTokenInvalid,
        title,
        subtitle,
        isValid: isFormValid,
        goToSignIn: onGoToSignIn,
        completionTitle,
    };

    // If children render prop is provided, use it for custom UI
    if (children) {
        return <div className={className}>{children(renderProps)}</div>;
    }

    // Default rendering

    // Loading state during token validation
    if (isValidatingToken) {
        return (
            <Card className={cx(className, styles.card)} variant={variant}>
                <Card.Content>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: '1rem' }}>
                        <Spinner size="medium" />
                        <Typography variant="body1">Validating your invite link...</Typography>
                    </div>
                </Card.Content>
            </Card>
        );
    }

    // Invalid token state
    if (isTokenInvalid) {
        return (
            <Card className={cx(className, styles.card)} variant={variant}>
                <Card.Header className={styles.header}>
                    <Card.Title level={2} className={styles.title}>Invalid Invite Link</Card.Title>
                </Card.Header>
                <Card.Content>
                    <Alert variant="error">
                        <Alert.Title>Unable to verify invite</Alert.Title>
                        <Alert.Description>
                            {apiError?.message || 'This invite link is invalid or has expired. Please contact your administrator for a new invite.'}
                        </Alert.Description>
                    </Alert>
                    {onGoToSignIn && (
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <Button variant="outline" onClick={onGoToSignIn}>
                                Go to Sign In
                            </Button>
                        </div>
                    )}
                </Card.Content>
            </Card>
        );
    }

    // Completion state
    if (isComplete) {
        return (
            <Card className={cx(className, styles.card)} variant={variant}>
                <Card.Header className={styles.header}>
                    <Card.Title level={2} className={styles.title}>Account Setup Complete!</Card.Title>
                </Card.Header>
                <Card.Content>
                    <Alert variant="success">
                        <Alert.Description>
                            Your account has been successfully set up. You can now sign in with your credentials.
                        </Alert.Description>
                    </Alert>
                    {onGoToSignIn && (
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <Button variant="solid" color="primary" onClick={onGoToSignIn}>
                                Sign In
                            </Button>
                        </div>
                    )}
                </Card.Content>
            </Card>
        );
    }

    // Flow components (password form)
    return (
        <Card className={cx(className, styles.card)} variant={variant}>
            {(showTitle || showSubtitle) && (title || subtitle) && (
                <Card.Header className={styles.header}>
                    {showTitle && title && <Card.Title level={2} className={styles.title}>{title}</Card.Title>}
                    {showSubtitle && subtitle && <Typography variant="body1" className={styles.subtitle}>{subtitle}</Typography>}
                </Card.Header>
            )}
            <Card.Content>
                {apiError && (
                    <div style={{ marginBottom: '1rem' }}>
                        <Alert variant="error">
                            <Alert.Description>{apiError.message}</Alert.Description>
                        </Alert>
                    </div>
                )}
                <div>
                    {componentsWithoutHeadings && componentsWithoutHeadings.length > 0 ? (
                        renderComponents(componentsWithoutHeadings)
                    ) : (
                        !isLoading && (
                            <Alert variant="warning">
                                <Typography variant="body1">No form components available</Typography>
                            </Alert>
                        )
                    )}
                    {isLoading && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                            <Spinner size="small" />
                        </div>
                    )}
                </div>
                {onGoToSignIn && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <Typography variant="body2">
                            Already have an account?{' '}
                            <Button
                                variant="text"
                                onClick={onGoToSignIn}
                                style={{ padding: 0, minWidth: 'auto' }}
                            >
                                Sign In
                            </Button>
                        </Typography>
                    </div>
                )}
            </Card.Content>
        </Card>
    );
};

export default BaseAcceptInvite;
