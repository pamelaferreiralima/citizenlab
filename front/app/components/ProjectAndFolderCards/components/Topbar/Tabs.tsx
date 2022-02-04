import React, { useRef, KeyboardEvent } from 'react';

// components
import { ScreenReaderOnly } from 'utils/a11y';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl, colors, media } from 'utils/styleUtils';
import { rgba } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from '../..';

const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  ${media.largePhone`
    width: 100%;
    justify-content: space-between;
  `}

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Tab = styled.button<{ active: boolean }>`
  box-sizing: content-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.large}px;
  padding: 0px 15px;

  border-bottom: ${({ active, theme }) =>
    active ? `3px solid ${theme.colorMain}` : '3px solid transparent'};

  color: ${({ active, theme }) => (active ? theme.colorMain : colors.label)};

  ${({ active, theme }) =>
    active
      ? ''
      : `
      &:hover {
        border-bottom: 3px solid ${rgba(theme.colorMain, 0.3)};
      }
      cursor: pointer;
    `}

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.base}px;
    padding: 0px 9px 14px;
  `}
`;

const StatusCount = styled.span`
  margin-left: 5px;

  ${media.smallerThanMinTablet`
    margin-left: 3px;
  `}
`;

interface Props {
  currentTab: PublicationTab;
  statusCounts: IStatusCounts;
  availableTabs: PublicationTab[];
  onChangeTab: (tab: PublicationTab) => void;
}

export const getTabId = (tab: PublicationTab) => `project-cards-tab-${tab}`;
export const getTabPanelId = (tab: PublicationTab) =>
  `project-cards-tab-panel-${tab}`;

const Tabs = ({
  currentTab,
  statusCounts,
  availableTabs,
  onChangeTab,
}: Props) => {
  const tabsRef = useRef({});

  const handleClickTab = (tab: PublicationTab) => () => {
    if (currentTab === tab) return;
    onChangeTab(tab);
  };

  const handleKeyDownTab = ({ key }: KeyboardEvent<HTMLButtonElement>) => {
    if (!LEFT_RIGHT_ARROW_KEYS.has(key)) return;

    const selectedTab = getSelectedTab(currentTab, availableTabs, key);
    onChangeTab(selectedTab);
    tabsRef.current[selectedTab].focus();
  };

  return (
    <TabsContainer role="tablist">
      <ScreenReaderOnly>
        <FormattedMessage {...messages.a11y_publicationStatusTabs} />
      </ScreenReaderOnly>

      {availableTabs.map((tab) => (
        <Tab
          id={getTabId(tab)}
          data-testid="tab"
          role="tab"
          aria-selected={currentTab === tab}
          tabIndex={currentTab === tab ? 0 : -1}
          aria-controls={getTabPanelId(tab)}
          active={currentTab === tab}
          key={tab}
          onClick={handleClickTab(tab)}
          onKeyDown={handleKeyDownTab}
          ref={(el) => el && (tabsRef.current[tab] = el)}
        >
          <div aria-hidden>
            <FormattedMessage {...messages[tab]} />
            <StatusCount>({statusCounts[tab]})</StatusCount>
          </div>

          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.a11y_tab}
              values={{
                tab: <FormattedMessage {...messages[tab]} />,
                count: statusCounts[tab],
              }}
            />
          </ScreenReaderOnly>
        </Tab>
      ))}
    </TabsContainer>
  );
};

export default Tabs;

const LEFT_RIGHT_ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight']);

function getSelectedTab(
  currentTab: PublicationTab,
  availableTabs: PublicationTab[],
  key: string
) {
  const currentTabIndex = availableTabs.indexOf(currentTab);
  let selectedTabIndex;

  if (key === 'ArrowLeft') {
    selectedTabIndex =
      currentTabIndex === 0 ? availableTabs.length - 1 : currentTabIndex - 1;
  }

  if (key === 'ArrowRight') {
    selectedTabIndex =
      currentTabIndex === availableTabs.length - 1 ? 0 : currentTabIndex + 1;
  }

  return availableTabs[selectedTabIndex];
}
