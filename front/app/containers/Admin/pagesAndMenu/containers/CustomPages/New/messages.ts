import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.pageTitle',
    defaultMessage: 'Create custom page',
  },
  contentEditorTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.contentEditorTitle',
    defaultMessage: 'Content',
  },
  saveButton: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.saveButton',
    defaultMessage: 'Save custom page',
  },
  buttonSuccess: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.buttonSuccess',
    defaultMessage: 'Success',
  },
  messageSuccess: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.messageSuccess',
    defaultMessage: 'Custom page saved',
  },
  error: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.error',
    defaultMessage: "Couldn't save custom page",
  },
  multilocError: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.multilocError',
    defaultMessage: 'Please enter a title in every language',
  },
  titleLabel: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.titleLabel',
    defaultMessage: 'Title',
  },
  slugLabel: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.slugLabel',
    defaultMessage: 'Page slug',
  },
  slugTooltip: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.slugTooltip',
    defaultMessage:
      'The slug is the unique set of words at the end of the page’s web address, or URL.',
  },
  slugRegexError: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.slugRegexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are forbidden.',
  },
  slugRequiredError: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.slugRequiredError',
    defaultMessage: 'You must enter a slug',
  },
  createCustomPage: {
    id: 'app.containers.Admin.PagesAndMenu.containers.CreateCustomPage.createCustomPage',
    defaultMessage: 'Create custom page',
  },
});
