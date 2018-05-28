// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import Helmet from 'react-helmet';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';

// i18n
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { stripHtml } from 'utils/textUtils';

interface InputProps {
  ideaId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  idea: GetIdeaChildProps;
  ideaImages: GetIdeaImagesChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaMeta: React.SFC<Props & InjectedIntlProps> = ({ locale, tenantLocales, idea, ideaImages, intl }) => {
  if (!isNilOrError(locale) && !isNilOrError(tenantLocales) && !isNilOrError(idea)) {
    const { formatMessage } = intl;
    const ideaTitle = `${formatMessage(messages.idea)} • ${getLocalized(idea.attributes.title_multiloc, locale, tenantLocales)}`;
    const ideaDescription = stripHtml(getLocalized(idea.attributes.body_multiloc, locale, tenantLocales), 250);
    const ideaImage = (ideaImages && ideaImages.length > 0 ? ideaImages[0].attributes.versions.large : null);
    const ideaUrl = window.location.href;

    return (
      <Helmet>
        <title>{ideaTitle}</title>
        <meta name="title" content={ideaTitle}/>
        <meta name="description" content={ideaDescription} />
        <meta property="og:title" content={ideaTitle} />
        <meta property="og:description" content={ideaDescription} />
        {ideaImage && <meta property="og:image" content={ideaImage} />}
        <meta property="og:url" content={ideaUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>
});

const IdeaMetaWithHoc = injectIntl<Props>(IdeaMeta);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaMetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
