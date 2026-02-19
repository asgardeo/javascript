import { FC, useEffect, useRef } from "react";
import { Organization } from "@asgardeo/browser";
import useAsgardeo from "../../contexts/Asgardeo/useAsgardeo";

interface OrganizationContextControllerProps {
  /**
   * ID of the organization to authenticate with
   */
  targetOrganizationId: string;

  /**
   * Whether the source provider is signed in
   */
  isSourceSignedIn: boolean;

  /**
   * Children to render
   */
  children: React.ReactNode;
}

const OrganizationContextController: FC<OrganizationContextControllerProps> = ({
  targetOrganizationId,
  isSourceSignedIn,
  children,
}) => {
  const { isInitialized, isSignedIn, switchOrganization, isLoading } = useAsgardeo();
  const hasAuthenticatedRef = useRef(false);
  const isAuthenticatingRef = useRef(false);

  /**
   * Handle the organization switch when:
   * - Current instance is initialized and NOT signed in
   * - Source provider IS signed in
   * Uses the `switchOrganization` function from the Asgardeo context.
   */
  useEffect(() => {
    const performOrganizationSwitch = async () => {
      // Prevent multiple authentication attempts
      if (hasAuthenticatedRef.current || isAuthenticatingRef.current) {
        return;
      }

      // Wait for initialization to complete
      if (!isInitialized || isLoading) {
        return;
      }

      // Only proceed if user is not already signed in to this instance
      if (isSignedIn) {
        hasAuthenticatedRef.current = true;
        return;
      }

      // CRITICAL: Only proceed if source provider is signed in
      if (!isSourceSignedIn) {
        return;
      }

      try {
        isAuthenticatingRef.current = true;
        hasAuthenticatedRef.current = true;

        // Build the organization object for authentication
        const targetOrganization: Organization = {
          id: targetOrganizationId,
          name: '', // Name will be populated after authentication
          orgHandle: '', // Will be populated after authentication
        };

        // Call the switchOrganization API from context (handles token exchange)
        await switchOrganization(targetOrganization);

      } catch (error) {
        console.error('Linked organization authentication failed:', error);
        
        // Reset the flag to allow retry
        hasAuthenticatedRef.current = false;
      } finally {
        isAuthenticatingRef.current = false;
      }
    };

    performOrganizationSwitch();
  }, [isInitialized, isSignedIn, isLoading, isSourceSignedIn, targetOrganizationId, switchOrganization]);

  return <>{children}</>;
};

export default OrganizationContextController;