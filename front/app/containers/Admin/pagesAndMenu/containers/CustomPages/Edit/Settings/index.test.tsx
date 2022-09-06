import React from 'react';
import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';
import EditCustomPageSettings from './';

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale');
jest.mock('hooks/useAppConfiguration', () => () => ({
  data: { attributes: { name: 'orgName', host: 'localhost' } },
}));

jest.mock('hooks/useCustomPage', () =>
  jest.fn(() => ({ attributes: { title_multiloc: { en: 'title' } } }))
);
jest.mock('services/customPages', () => ({
  // `async` simulates the original `updateCustomPage` which is also `async`.
  // It's important for testing it properly.
  updateCustomPage: jest.fn(async () => {
    // copied from
    // https://github.com/CitizenLabDotCo/citizenlab/blob/e437c601eeb606bb5e9c46bde9a5b46c1642b65f/front/app/utils/request.ts#L57
    const error = new Error('error');
    Object.assign(error, {
      json: {
        errors: {
          slug: [{ error: 'taken', value: 'existing-slug' }],
        },
      },
    });
    throw error;
  }),
}));

describe('EditCustomPageSettings', () => {
  describe('Edit custom page', () => {
    it('renders error in case of invalid slug', async () => {
      const { container } = render(<EditCustomPageSettings />);

      fireEvent.change(screen.getByRole('textbox', { name: 'Page URL' }), {
        target: {
          value: 'existing-slug',
        },
      });
      fireEvent.click(container.querySelector('button[type="submit"]'));
      await waitFor(() => {
        expect(screen.getAllByTestId('error-message')).toHaveLength(2);
        expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
      });
    });
  });
});
