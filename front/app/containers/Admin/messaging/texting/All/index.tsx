import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import { GetCampaignsChildProps } from 'resources/GetCampaigns';
import { isDraft } from 'services/textingCampaigns';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { Icon } from '@citizenlab/cl2-component-library';
import Pagination from 'components/admin/Pagination';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DraftCampaignRow from './DraftCampaignRow';
import SentCampaignRow from './SentCampaignRow';

import messages from '../../messages';

import { fontSizes, colors } from 'utils/styleUtils';

const NoCampaignsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0 100px;
  text-align: center;
`;

const NoCampaignsHeader = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const NoCampaignsDescription = styled.p`
  color: ${colors.adminSecondaryTextColor};
  font-weight: 400;
  font-size: ${fontSizes.base}px;
  margin-bottom: 30px;
  max-width: 450px;
`;

const texting_campaigns = [
  {
    id: '1',
    attributes: {
      sent_at: '2022-03-15T16:01:04.697Z',
      body_multiloc: {
        en: 'test sent text',
        'fr-BE': 'test sent text',
        'nl-BE': 'test sent text',
      },
      phone_numbers: [1234567890, 1234567891],
      status: 'sent',
    },
  },
  {
    id: '2',
    attributes: {
      sent_at: '2022-03-15T16:01:04.697Z',
      body_multiloc: {
        en: 'test draft text',
        'fr-BE': 'test draft text',
        'nl-BE': 'test draft text',
      },
      phone_numbers: [1234567890, 1234567891],
      status: 'draft',
    },
  },
];

interface InputProps {}

interface DataProps extends GetCampaignsChildProps {}

export interface Props extends InputProps, DataProps {}

interface State {}

class TextingCampaigns extends React.Component<
  Props & InjectedIntlProps,
  State
> {
  render() {
    const { currentPage, lastPage } = this.props;

    if (isNilOrError(texting_campaigns)) return null;

    if (texting_campaigns.length === 0) {
      return (
        <>
          <NoCampaignsWrapper>
            <Icon name="mailBig" />
            <NoCampaignsHeader>
              <FormattedMessage {...messages.noCampaignsHeader} />
            </NoCampaignsHeader>
            <NoCampaignsDescription>
              <FormattedMessage {...messages.noCampaignsDescription} />
            </NoCampaignsDescription>
            <Button
              buttonStyle="cl-blue"
              icon="plus-circle"
              linkTo="/admin/messaging/emails/custom/new"
            >
              <FormattedMessage {...messages.addCampaignButton} />
            </Button>
          </NoCampaignsWrapper>
        </>
      );
    }

    return (
      <>
        <ButtonWrapper>
          <Button
            buttonStyle="cl-blue"
            icon="plus-circle"
            linkTo="/admin/messaging/emails/custom/new" // TODO: Link to texting/new when it exists
          >
            <FormattedMessage {...messages.addTextButton} />
          </Button>
        </ButtonWrapper>
        <List key={texting_campaigns.map((c) => c.id).join()}>
          {texting_campaigns.map((campaign) =>
            isDraft(campaign) ? (
              <DraftCampaignRow key={campaign.id} campaign={campaign} />
            ) : (
              <SentCampaignRow key={campaign.id} campaign={campaign} />
            )
          )}
        </List>
        <Pagination
          currentPage={currentPage}
          totalPages={lastPage}
          loadPage={this.props.onChangePage}
        />
      </>
    );
  }
}

const TextingCampaignsWithInjectedIntl = injectIntl<Props>(TextingCampaigns);

export default TextingCampaignsWithInjectedIntl;
