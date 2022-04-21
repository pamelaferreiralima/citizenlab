import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import TabbedResource from '.';
import { WithRouterProps } from 'react-router';

const getRouterProps = (tabId, tabName?: string) =>
  ({
    location: {
      pathname: `/admin/projects/${tabId}/${tabName}`,
    },
    params: {
      tabId,
    },
  } as any as WithRouterProps);

const children = (
  <>
    <div>hi</div>
  </>
);

const fakeTabs = [
  {
    name: 'FirstTab',
    label: 'First Tab',
    url: '/first',
  },
  {
    name: 'SecondTab',
    label: 'Second Tab',
    url: '/second',
  },
  {
    name: 'ThirdTab',
    label: 'Third Tab',
    url: '/third',
    active: true,
  },
];

const fakeResource = {
  title: 'Tab page',
  subtitle: 'Fake Tab Page',
};

describe('<TabbedResource />', () => {
  it('renders tabs and header properly including an active tab', () => {
    const routerProps = getRouterProps('continuousInformation');

    const { container } = render(
      <TabbedResource
        resource={fakeResource}
        tabs={fakeTabs}
        children={children}
        {...routerProps}
      />
    );

    expect(container.getElementsByClassName('active')).toHaveLength(1);
    expect(screen.getByText('Third Tab')).toBeInTheDocument();
    expect(screen.getByText('Tab page')).toBeInTheDocument();
    expect(screen.getByText('Fake Tab Page')).toBeInTheDocument();
  });

  it('renders properly with an optional status label', () => {
    const routerProps = getRouterProps('continuousInformation');

    const tabsIncludingOneWithStatusLabel = [
      ...fakeTabs,
      {
        name: 'FourthTab',
        label: 'Fourth Tab',
        url: '/fourth',
        statusLabel: 'Beta Tag',
      },
    ];

    render(
      <TabbedResource
        resource={fakeResource}
        tabs={tabsIncludingOneWithStatusLabel}
        children={children}
        {...routerProps}
      />
    );
    expect(screen.getByText('Beta Tag')).toBeInTheDocument();
  });
});
