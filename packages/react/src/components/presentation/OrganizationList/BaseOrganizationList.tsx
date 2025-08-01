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

import {AllOrganizationsApiResponse, Organization} from '@asgardeo/browser';
import {cx} from '@emotion/css';
import {FC, ReactElement, ReactNode, useMemo, CSSProperties} from 'react';
import useTheme from '../../../contexts/Theme/useTheme';
import useTranslation from '../../../hooks/useTranslation';
import Dialog from '../../primitives/Dialog/Dialog';
import Avatar from '../../primitives/Avatar/Avatar';
import Button from '../../primitives/Button/Button';
import Typography from '../../primitives/Typography/Typography';
import Spinner from '../../primitives/Spinner/Spinner';
import useStyles from './BaseOrganizationList.styles';

export interface OrganizationWithSwitchAccess extends Organization {
  canSwitch: boolean;
}

/**
 * Props interface for the BaseOrganizationList component.
 */
export interface BaseOrganizationListProps {
  /**
   * Additional CSS class names to apply to the container
   */
  className?: string;
  /**
   * List of organizations discoverable to the signed-in user.
   */
  allOrganizations: AllOrganizationsApiResponse;
  /**
   * List of organizations associated to the signed-in user.
   */
  myOrganizations: Organization[];
  /**
   * Error message to display
   */
  error?: string | null;
  /**
   * Function called when "Load More" is clicked
   */
  fetchMore?: () => Promise<void>;
  /**
   * Whether there are more organizations to load
   */
  hasMore?: boolean;
  /**
   * Whether the initial data is loading
   */
  isLoading?: boolean;
  /**
   * Whether more data is being loaded
   */
  isLoadingMore?: boolean;
  /**
   * Function called when refresh is requested
   */
  onRefresh?: () => Promise<void>;
  /**
   * Custom renderer for when no organizations are found
   */
  renderEmpty?: () => ReactNode;
  /**
   * Custom renderer for the error state
   */
  renderError?: (error: string) => ReactNode;
  /**
   * Custom renderer for the load more button
   */
  renderLoadMore?: (onLoadMore: () => Promise<void>, isLoading: boolean) => ReactNode;
  /**
   * Custom renderer for the loading state
   */
  renderLoading?: () => ReactNode;
  /**
   * Custom renderer for each organization item
   */
  renderOrganization?: (organization: OrganizationWithSwitchAccess, index: number) => ReactNode;
  /**
   * Function called when an organization is selected/clicked
   */
  onOrganizationSelect?: (organization: OrganizationWithSwitchAccess) => void;
  /**
   * Inline styles to apply to the container
   */
  style?: React.CSSProperties;
  /**
   * Display mode: 'inline' for normal display, 'popup' for modal dialog
   */
  mode?: 'inline' | 'popup';
  /**
   * Function called when popup open state changes (only used in popup mode)
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the popup is open (only used in popup mode)
   */
  open?: boolean;
  /**
   * Title for the popup dialog (only used in popup mode)
   */
  title?: string;
  /**
   * Whether to show the organization status in the list
   */
  showStatus?: boolean;
}

/**
 * Default organization item renderer
 */
const defaultRenderOrganization = (
  organization: OrganizationWithSwitchAccess,
  styles: any,
  t: (key: string, params?: Record<string, string | number>) => string,
  onOrganizationSelect?: (organization: OrganizationWithSwitchAccess) => void,
  showStatus?: boolean,
): ReactNode => {
  return (
    <div key={organization.id} className={cx(styles.organizationItem)}>
      <div className={cx(styles.organizationContent)}>
        <Avatar variant="square" name={organization.name} size={48} alt={`${organization.name} logo`} />
        <div className={cx(styles.organizationInfo)}>
          <Typography variant="h6" className={cx(styles.organizationName)}>
            {organization.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" className={cx(styles.organizationHandle)}>
            @{organization.orgHandle}
          </Typography>
          {showStatus && (
            <Typography variant="body2" color="textSecondary" className={cx(styles.organizationStatus)}>
              {t('organization.switcher.status.label')}{' '}
              <span
                className={cx(
                  styles.statusText,
                  organization.status === 'ACTIVE' ? styles.statusTextActive : styles.statusTextInactive,
                )}
              >
                {organization.status}
              </span>
            </Typography>
          )}
        </div>
      </div>
      {organization.canSwitch && (
        <div className={cx(styles.organizationActions)}>
          <Button
            onClick={e => {
              e.stopPropagation();
              onOrganizationSelect(organization);
            }}
            type="button"
            size="small"
          >
            {t('organization.switcher.switch.button')}
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Default loading renderer
 */
const defaultRenderLoading = (
  t: (key: string, params?: Record<string, string | number>) => string,
  styles: any,
): ReactNode => (
  <div className={cx(styles.loadingContainer)}>
    <Spinner size="medium" />
    <Typography variant="body1" color="textSecondary" className={cx(styles.loadingText)}>
      {t('organization.switcher.loading.organizations')}
    </Typography>
  </div>
);

/**
 * Default error renderer
 */
const defaultRenderError = (
  error: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  styles: any,
): ReactNode => (
  <div className={cx(styles.errorContainer)}>
    <Typography variant="body1" color="error">
      <strong>{t('organization.switcher.error.prefix')}</strong> {error}
    </Typography>
  </div>
);

/**
 * Default load more button renderer
 */
const defaultRenderLoadMore = (
  onLoadMore: () => Promise<void>,
  isLoading: boolean,
  t: (key: string, params?: Record<string, string | number>) => string,
  styles: any,
): ReactNode => (
  <Button onClick={onLoadMore} disabled={isLoading} className={cx(styles.loadMoreButton)} type="button" fullWidth>
    {isLoading ? t('organization.switcher.loading.more') : t('organization.switcher.load.more')}
  </Button>
);

/**
 * Default empty state renderer
 */
const defaultRenderEmpty = (
  t: (key: string, params?: Record<string, string | number>) => string,
  styles: any,
): ReactNode => (
  <div className={cx(styles.emptyContainer)}>
    <Typography variant="body1" color="textSecondary" className={cx(styles.emptyText)}>
      {t('organization.switcher.no.organizations')}
    </Typography>
  </div>
);

/**
 * BaseOrganizationList component displays a list of organizations with pagination support.
 * This component serves as the base for framework-specific implementations.
 *
 * @example
 * ```tsx
 * <BaseOrganizationList
 *   data={organizations}
 *   isLoading={isLoading}
 *   hasMore={hasMore}
 *   fetchMore={fetchMore}
 *   error={error}
 * />
 * ```
 */
export const BaseOrganizationList: FC<BaseOrganizationListProps> = ({
  className = '',
  allOrganizations,
  myOrganizations,
  error,
  fetchMore,
  hasMore = false,
  isLoading = false,
  isLoadingMore = false,
  mode = 'inline',
  onOpenChange,
  onOrganizationSelect,
  onRefresh,
  open = false,
  renderEmpty,
  renderError,
  renderLoading,
  renderLoadMore,
  renderOrganization,
  style,
  title = 'Organizations',
  showStatus,
}): ReactElement => {
  const {theme, colorScheme} = useTheme();
  const styles = useStyles(theme, colorScheme);
  const {t} = useTranslation();

  const organizationsWithSwitchAccess: OrganizationWithSwitchAccess[] = useMemo(() => {
    if (!allOrganizations?.organizations) {
      return [];
    }

    const myOrgIds = new Set(myOrganizations?.map(org => org.id) || []);

    return allOrganizations.organizations.map(org => ({
      ...org,
      canSwitch: myOrgIds.has(org.id),
    }));
  }, [allOrganizations?.organizations, myOrganizations]);

  const renderLoadingWithStyles = renderLoading || (() => defaultRenderLoading(t, styles));
  const renderErrorWithStyles = renderError || ((error: string) => defaultRenderError(error, t, styles));
  const renderEmptyWithStyles = renderEmpty || (() => defaultRenderEmpty(t, styles));
  const renderLoadMoreWithStyles =
    renderLoadMore ||
    ((onLoadMore: () => Promise<void>, isLoading: boolean) => defaultRenderLoadMore(onLoadMore, isLoading, t, styles));
  const renderOrganizationWithStyles =
    renderOrganization ||
    ((org: OrganizationWithSwitchAccess) =>
      defaultRenderOrganization(org, styles, t, onOrganizationSelect, showStatus));

  if (isLoading && organizationsWithSwitchAccess?.length === 0) {
    const loadingContent = (
      <div className={cx(styles.root, className)} style={style}>
        {renderLoadingWithStyles()}
      </div>
    );

    if (mode === 'popup') {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <Dialog.Content>
            <Dialog.Heading>{title}</Dialog.Heading>
            <div className={cx(styles.popupContent)}>{loadingContent}</div>
          </Dialog.Content>
        </Dialog>
      );
    }

    return loadingContent;
  }

  if (error && organizationsWithSwitchAccess?.length === 0) {
    const errorContent = (
      <div className={cx(styles.root, className)} style={style}>
        {renderErrorWithStyles(error)}
      </div>
    );

    if (mode === 'popup') {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <Dialog.Content>
            <Dialog.Heading>{title}</Dialog.Heading>
            <div className={cx(styles.popupContent)}>{errorContent}</div>
          </Dialog.Content>
        </Dialog>
      );
    }

    return errorContent;
  }

  if (!isLoading && organizationsWithSwitchAccess?.length === 0) {
    const emptyContent = (
      <div className={cx(styles.root, className)} style={style}>
        {renderEmptyWithStyles()}
      </div>
    );

    if (mode === 'popup') {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <Dialog.Content>
            <Dialog.Heading>{title}</Dialog.Heading>
            <div className={cx(styles.popupContent)}>{emptyContent}</div>
          </Dialog.Content>
        </Dialog>
      );
    }

    return emptyContent;
  }

  const organizationListContent = (
    <div className={cx(styles.root, className)} style={style}>
      {/* Header with total count and refresh button */}
      <div className={cx(styles.header)}>
        <div className={cx(styles.headerInfo)}>
          <Typography variant="body2" color="textSecondary" className={cx(styles.subtitle)}>
            {t('organization.switcher.showing.count', {
              showing: organizationsWithSwitchAccess?.length,
              total: allOrganizations?.organizations?.length || 0,
            })}
          </Typography>
        </div>
        {onRefresh && (
          <Button onClick={onRefresh} className={cx(styles.refreshButton)} type="button" variant="outline" size="small">
            {t('organization.switcher.refresh.button')}
          </Button>
        )}
      </div>

      {/* Organizations list */}
      <div className={cx(styles.listContainer)}>
        {organizationsWithSwitchAccess?.map((organization: OrganizationWithSwitchAccess, index: number) =>
          renderOrganizationWithStyles(organization, index),
        )}
      </div>

      {/* Error message for additional data */}
      {error && organizationsWithSwitchAccess?.length > 0 && (
        <div className={cx(styles.errorMargin)}>{renderErrorWithStyles(error)}</div>
      )}

      {/* Load more button */}
      {hasMore && fetchMore && (
        <div className={cx(styles.loadMoreMargin)}>{renderLoadMoreWithStyles(fetchMore, isLoadingMore)}</div>
      )}
    </div>
  );

  if (mode === 'popup') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Heading>{title}</Dialog.Heading>
          <div className={cx(styles.popupContent)}>{organizationListContent}</div>
        </Dialog.Content>
      </Dialog>
    );
  }

  return organizationListContent;
};

export default BaseOrganizationList;
