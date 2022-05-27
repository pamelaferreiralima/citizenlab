import React from 'react';

import Link from 'utils/cl-router/Link';
import { withRouter, WithRouterProps } from 'utils/withRouter';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';

// utils
import { matchPathToUrl } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

const Insights: React.FC<InjectedIntlProps & WithRouterProps> = ({
  location: { pathname },
  intl: { formatMessage },
}) => {
  const projectReportsFeatureFlag = useFeatureFlag({ name: 'project_reports' });
  const manualInsightsFeatureFlag = useFeatureFlag({
    name: 'insights_manual_flow',
  });
  const tabs = [
    ...(manualInsightsFeatureFlag
      ? [{ label: messages.tabInsights, url: '/admin/insights' }]
      : []),
    ...(projectReportsFeatureFlag
      ? [{ label: messages.tabReports, url: '/admin/insights/reports' }]
      : []),
  ];
  return (
    <div id="e2e-insights-container">
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      {tabs.some(
        (tab) =>
          matchPathToUrl(tab.url).test(pathname) ||
          pathname.includes('/reports/')
      ) ? (
        <>
          <NavigationTabs>
            {tabs.map((tab) => (
              <Tab
                key={tab.url}
                active={matchPathToUrl(tab.url).test(pathname)}
              >
                <Link to={tab.url}>{formatMessage(tab.label)}</Link>
              </Tab>
            ))}
          </NavigationTabs>
          <TabsPageLayout>
            <RouterOutlet />
          </TabsPageLayout>
        </>
      ) : (
        <RouterOutlet />
      )}
    </div>
  );
};

export default withRouter(injectIntl(Insights));
