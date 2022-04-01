import {
  addContentBuilderLayout,
  IContentBuilderLayoutObject,
} from 'modules/commercial/content_builder/services/contentBuilder';
import React from 'react';
import { Multiloc } from 'typings';
import { render, screen } from 'utils/testUtils/rtl';
import ContentBuilderToggle from './';

const mockContentBuilderLayoutData = {
  data: {
    attributes: {
      enabled: false,
    },
  },
};
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));
jest.mock('modules/commercial/content_builder/hooks/useContentBuilder', () => {
  return jest.fn(() => mockContentBuilderLayoutData);
});
jest.mock('modules/commercial/content_builder/services/contentBuilder', () => ({
  addContentBuilderLayout: jest.fn(),
}));
jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} />;
      };
    },
    Link: () => 'LinkText',
  };
});

const dummyFunction = jest.fn();
const multiloc = 'en' as Multiloc;

const routerProps = {
  location: {
    pathname: '/admin/projects/projectID/description',
  },
  params: {
    projectId: 'projectId',
  },
};

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('ContentBuilderToggle', () => {
  it('shows confirm link  appropriately when builder option toggled', () => {
    render(
      <ContentBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    const toggle = screen.getByRole('checkbox');
    expect(screen.queryByText('LinkText')).not.toBeInTheDocument();
    toggle.click();
    expect(screen.queryByText('LinkText')).toBeInTheDocument();
    const mockLayoutData = { enabled: true } as IContentBuilderLayoutObject;
    expect(addContentBuilderLayout).toHaveBeenCalledWith(
      { projectId: 'projectId', code: undefined },
      mockLayoutData
    );
  });
  it('shows confirm Quill editor appropriately when builder option toggled', () => {
    render(
      <ContentBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    const toggle = screen.getByRole('checkbox');
    expect(screen.queryByText('QuillLabel')).toBeInTheDocument();
    toggle.click();
    expect(screen.queryByText('QuillLabel')).not.toBeInTheDocument();
    const mockLayoutData = { enabled: true } as IContentBuilderLayoutObject;
    expect(addContentBuilderLayout).toHaveBeenCalledWith(
      { projectId: 'projectId', code: undefined },
      mockLayoutData
    );
  });
  it('does not render component when feature flag is not active', () => {
    mockFeatureFlagData = false;
    render(
      <ContentBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    expect(
      screen.queryByTestId('contentBuilderToggle')
    ).not.toBeInTheDocument();
  });
});
