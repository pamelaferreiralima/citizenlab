import React from 'react';
import Inputs from './';

import { render, screen } from 'utils/testUtils/rtl';
import inputs from 'modules/commercial/insights/fixtures/inputs';

const viewId = '1';

let mockInputsData = {
  loading: false,
  hasMore: true,
  list: inputs,
};

const mockIdeaData = {
  id: '2',
  type: 'idea',
  attributes: {
    title_multiloc: { en: 'Test Idea' },
  },
};

const mockLocationData = { pathname: '', query: {} };

jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

jest.mock('utils/cl-router/history');

jest.mock('modules/commercial/insights/hooks/useInsightsInputsLoadMore', () => {
  return jest.fn(() => mockInputsData);
});

jest.mock('hooks/useLocale');

jest.mock('utils/cl-intl');

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={mockLocationData}
          />
        );
      };
    },
    Link: () => 'Link',
  };
});

const onPreviewInput = jest.fn();

describe('Insights Details Inputs', () => {
  it('renders', () => {
    render(<Inputs onPreviewInput={onPreviewInput} inputs={mockInputsData} />);
    expect(screen.getByTestId('insightsDetailsInputs')).toBeInTheDocument();
  });

  it('renders correct number of input cards', () => {
    render(<Inputs onPreviewInput={onPreviewInput} inputs={mockInputsData} />);
    expect(screen.getAllByTestId('insightsInputCard')).toHaveLength(
      mockInputsData.list.length
    );
  });

  it('shows load more button when there is a next page', () => {
    render(<Inputs onPreviewInput={onPreviewInput} inputs={mockInputsData} />);
    expect(screen.getByTestId('insightsDetailsLoadMore')).toBeInTheDocument();
  });

  it('does not show load more button when there is no next page', () => {
    mockInputsData = {
      hasMore: false,
      list: inputs,
      loading: false,
    };
    render(<Inputs onPreviewInput={onPreviewInput} inputs={mockInputsData} />);
    expect(
      screen.queryByTestId('insightsDetailsLoadMore')
    ).not.toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockInputsData = {
      hasMore: false,
      list: [],
      loading: false,
    };
    render(<Inputs onPreviewInput={onPreviewInput} inputs={mockInputsData} />);
    expect(screen.getByTestId('insightsDetailsEmpty')).toBeInTheDocument();
  });
});

// test loader
