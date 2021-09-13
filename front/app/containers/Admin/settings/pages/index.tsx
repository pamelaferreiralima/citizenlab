import React from 'react';
import { FIXED_PAGES_ALLOWED_TO_EDIT } from 'services/pages';
import PageEditor from '../policies/PageEditor';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// components
import Link from 'utils/cl-router/Link';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const AdminSettingsPages = ({ intl: { formatMessage } }: InjectedIntlProps) => (
  <>
    <SectionTitle>{formatMessage(messages.fixedPagesTitle)}</SectionTitle>
    <SectionDescription>
      {formatMessage(messages.fixedPagesSubtitle1)}

      <Link to="/admin/settings/policies">
        {formatMessage(messages.fixedPagesSubtitleLink)}
      </Link>

      {formatMessage(messages.fixedPagesSubtitle2)}
    </SectionDescription>
    {FIXED_PAGES_ALLOWED_TO_EDIT.map((slug) => (
      <PageEditor key={slug} slug={slug} />
    ))}
  </>
);

export default injectIntl(AdminSettingsPages);
