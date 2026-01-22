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
import { EmbeddedFlowType } from '@asgardeo/browser';
import { cx } from '@emotion/css';
import { renderInviteUserComponents } from '../../AuthOptionFactory';
import { normalizeFlowResponse, extractErrorMessage } from '../../../../../utils/v2/flowTransformer';
import useTranslation from '../../../../../hooks/useTranslation';
import useTheme from '../../../../../contexts/Theme/useTheme';
import useStyles from './BaseInviteUser.styles';
import Card, { CardProps } from '../../../../primitives/Card/Card';
import Typography from '../../../../primitives/Typography/Typography';
import Alert from '../../../../primitives/Alert/Alert';
import Spinner from '../../../../primitives/Spinner/Spinner';
import Button from '../../../../primitives/Button/Button';

/**
 * Flow response structure from the backend.
 */
export interface InviteUserFlowResponse {
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
 * Render props for custom UI rendering of InviteUser.
 */
export interface BaseInviteUserRenderProps {
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
     * Generated invite link (available after user provisioning).
     */
    inviteLink?: string;

    /**
     * Current flow ID.
     */
    flowId?: string;

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
     * Whether the invite link has been generated (admin flow complete).
     */
    isInviteGenerated: boolean;

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
     * Copy invite link to clipboard.
     */
    copyInviteLink: () => Promise<void>;

    /**
     * Whether the invite link was copied.
     */
    inviteLinkCopied: boolean;

    /**
     * Reset the flow to invite another user.
     */
    resetFlow: () => void;
}

/**
 * Props for the BaseInviteUser component.
 */
export interface BaseInviteUserProps {
    /**
     * Callback when the invite link is generated successfully.
     */
    onInviteLinkGenerated?: (inviteLink: string, flowId: string) => void;

    /**
     * Callback when an error occurs.
     */
    onError?: (error: Error) => void;

    /**
     * Callback when the flow state changes.
     */
    onFlowChange?: (response: InviteUserFlowResponse) => void;

    /**
     * Function to initialize the invite user flow.
     * This should make an authenticated request to the flow/execute endpoint.
     */
    onInitialize: (payload: Record<string, any>) => Promise<InviteUserFlowResponse>;

    /**
     * Function to submit flow step data.
     * This should make an authenticated request to the flow/execute endpoint.
     */
    onSubmit: (payload: Record<string, any>) => Promise<InviteUserFlowResponse>;

    /**
     * Custom CSS class name.
     */
    className?: string;

    /**
     * Render props function for custom UI.
     * If not provided, default UI will be rendered.
     */
    children?: (props: BaseInviteUserRenderProps) => ReactNode;

    /**
     * Whether the SDK is initialized.
     */
    isInitialized?: boolean;

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
 * Base component for invite user flow.
 * Handles the flow logic for creating a user and generating an invite link.
 *
 * When no children are provided, renders a default UI with:
 * - Loading spinner during initialization
 * - Error alerts for failures
 * - Flow components (user type selection, user details form)
 * - Invite link display with copy functionality
 *
 * Flow steps handled:
 * 1. User type selection (if multiple types available)
 * 2. User details input (username, email)
 * 3. Invite link generation
 */
const BaseInviteUser: FC<BaseInviteUserProps> = ({
    onInitialize,
    onSubmit,
    onError,
    onFlowChange,
    onInviteLinkGenerated,
    className = '',
    children,
    isInitialized = true,
    size = 'medium',
    variant = 'outlined',
    showTitle = true,
    showSubtitle = true,
}) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const styles = useStyles(theme, theme.vars.colors.text.primary);
    const [isLoading, setIsLoading] = useState(false);
    const [isFlowInitialized, setIsFlowInitialized] = useState(false);
    const [currentFlow, setCurrentFlow] = useState<InviteUserFlowResponse | null>(null);
    const [apiError, setApiError] = useState<Error | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const [inviteLink, setInviteLink] = useState<string | undefined>();
    const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
    const [isFormValid, setIsFormValid] = useState(true);

    const initializationAttemptedRef = useRef(false);

    /**
     * Handle error responses and extract meaningful error messages.
     * Uses the transformer's extractErrorMessage function for consistency.
     */
    const handleError = useCallback(
        (error: any) => {
            // Extract error message from response failureReason or use extractErrorMessage
            const errorMessage: string = error?.failureReason || extractErrorMessage(error, t, 'components.inviteUser.errors.generic');

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
        (response: InviteUserFlowResponse): InviteUserFlowResponse => {
            if (!response?.data?.meta?.components) {
                return response;
            }

            try {
                const { components } = normalizeFlowResponse(response, t, {
                    defaultErrorKey: 'components.inviteUser.errors.generic',
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
                        (comp.type === 'TEXT_INPUT' || comp.type === 'EMAIL_INPUT' || comp.type === 'SELECT') &&
                        comp.required &&
                        comp.ref
                    ) {
                        const value = formValues[comp.ref];
                        if (!value || value.trim() === '') {
                            errors[comp.ref] = `${comp.label || comp.ref} is required`;
                        }
                        // Email validation
                        if (comp.type === 'EMAIL_INPUT' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            errors[comp.ref] = 'Please enter a valid email address';
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

                // Check if invite link is in the response
                if (response.data?.additionalData?.['inviteLink']) {
                    const inviteLinkValue = response.data.additionalData['inviteLink'];
                    setInviteLink(inviteLinkValue);
                    onInviteLinkGenerated?.(inviteLinkValue, response.flowId);
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
        [currentFlow, formValues, validateForm, onSubmit, onFlowChange, onInviteLinkGenerated, handleError, normalizeFlowResponseLocal],
    );

    /**
     * Copy invite link to clipboard.
     */
    const copyInviteLink = useCallback(async () => {
        if (!inviteLink) return;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setInviteLinkCopied(true);
            setTimeout(() => setInviteLinkCopied(false), 3000);
        } catch {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = inviteLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setInviteLinkCopied(true);
            setTimeout(() => setInviteLinkCopied(false), 3000);
        }
    }, [inviteLink]);

    /**
     * Reset the flow to invite another user.
     */
    const resetFlow = useCallback(() => {
        setIsFlowInitialized(false);
        setCurrentFlow(null);
        setApiError(null);
        setFormValues({});
        setFormErrors({});
        setTouchedFields({});
        setInviteLink(undefined);
        setInviteLinkCopied(false);
        initializationAttemptedRef.current = false;
    }, []);

    /**
     * Initialize the flow on component mount.
     */
    useEffect(() => {
        if (isInitialized && !isFlowInitialized && !initializationAttemptedRef.current) {
            initializationAttemptedRef.current = true;

            (async () => {
                setIsLoading(true);
                setApiError(null);

                try {
                    const payload = {
                        flowType: EmbeddedFlowType.UserOnboarding,
                        verbose: true,
                    };

                    const rawResponse = await onInitialize(payload);
                    const response = normalizeFlowResponseLocal(rawResponse);
                    setCurrentFlow(response);
                    setIsFlowInitialized(true);
                    onFlowChange?.(response);

                    // Check for immediate error
                    if (response.flowStatus === 'ERROR') {
                        handleError(response);
                    }
                } catch (err) {
                    handleError(err);
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [isInitialized, isFlowInitialized, onInitialize, onFlowChange, handleError, normalizeFlowResponseLocal]);

    /**
     * Recalculate form validity whenever form values or components change.
     * This ensures the submit button is enabled/disabled correctly as the user types.
     */
    useEffect(() => {
        if (currentFlow && isFlowInitialized) {
            const components = currentFlow.data?.components || [];
            if (components.length > 0) {
                const validation = validateForm(components);
                setIsFormValid(validation.isValid);
            }
        }
    }, [formValues, currentFlow, isFlowInitialized, validateForm]);

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
    const isInviteGenerated = !!inviteLink;

    // Render props
    const renderProps: BaseInviteUserRenderProps = {
        values: formValues,
        fieldErrors: formErrors,
        error: apiError,
        touched: touchedFields,
        isLoading,
        components,
        inviteLink,
        flowId: currentFlow?.flowId,
        handleInputChange,
        handleInputBlur,
        handleSubmit,
        isInviteGenerated,
        title,
        subtitle,
        isValid: isFormValid,
        copyInviteLink,
        inviteLinkCopied,
        resetFlow,
    };

    // If children render prop is provided, use it for custom UI
    if (children) {
        return <div className={className}>{children(renderProps)}</div>;
    }

    // Default rendering

    // Waiting for SDK initialization
    if (!isInitialized) {
        return (
            <Card className={cx(className, styles.card)} variant={variant}>
                <Card.Content>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Spinner size="medium" />
                    </div>
                </Card.Content>
            </Card>
        );
    }

    // Loading state during initialization
    if (!isFlowInitialized && isLoading) {
        return (
            <Card className={cx(className, styles.card)} variant={variant}>
                <Card.Content>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Spinner size="medium" />
                    </div>
                </Card.Content>
            </Card>
        );
    }

    // Error state during initialization
    if (!currentFlow && apiError) {
        return (
            <Card className={cx(className, styles.card)} variant={variant}>
                <Card.Content>
                    <Alert variant="error">
                        <Alert.Title>Error</Alert.Title>
                        <Alert.Description>{apiError.message}</Alert.Description>
                    </Alert>
                </Card.Content>
            </Card>
        );
    }

    // Invite link generated - success state
    if (isInviteGenerated && inviteLink) {
        return (
            <Card className={cx(className, styles.card)} variant={variant}>
                <Card.Header className={styles.header}>
                    <Card.Title level={2} className={styles.title}>Invite Link Generated!</Card.Title>
                </Card.Header>
                <Card.Content>
                    <Alert variant="success">
                        <Alert.Description>Share this link with the user to complete their registration.</Alert.Description>
                    </Alert>
                    <div style={{ marginTop: '1rem' }}>
                        <Typography variant="body2" style={{ marginBottom: '0.5rem' }}>
                            Invite Link
                        </Typography>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem',
                                backgroundColor: 'var(--asgardeo-color-background-secondary, #f5f5f5)',
                                borderRadius: '4px',
                                wordBreak: 'break-all',
                            }}
                        >
                            <Typography variant="body2" style={{ flex: 1 }}>
                                {inviteLink}
                            </Typography>
                            <Button variant="outline" size="small" onClick={copyInviteLink}>
                                {inviteLinkCopied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                        <Button variant="outline" onClick={resetFlow}>
                            Invite Another User
                        </Button>
                    </div>
                </Card.Content>
            </Card>
        );
    }

    // Flow components
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
            </Card.Content>
        </Card>
    );
};

export default BaseInviteUser;
