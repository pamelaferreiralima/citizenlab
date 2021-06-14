import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { getTheme } from 'utils/styleUtils';
import GlobalStyle from 'global-styles';
import { IntlProvider } from 'react-intl';
import messages from 'i18n/en';

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider theme={getTheme(null)}>
      <GlobalStyle />
      <IntlProvider locale="en" messages={messages}>
        <div id="modal-portal">{children}</div>
      </IntlProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
export { userEvent };
