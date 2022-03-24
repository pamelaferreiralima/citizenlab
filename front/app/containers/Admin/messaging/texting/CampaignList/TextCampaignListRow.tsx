import React from 'react';

// components
import { StatusLabel } from '@citizenlab/cl2-component-library';
import messages from '../../messages';
import Button from 'components/UI/Button';
import Link from 'utils/cl-router/Link';

// typings
import {
  ITextingCampaignData,
  ITextingCampaignStatuses,
} from 'services/textingCampaigns';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedTime, FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  campaign: ITextingCampaignData;
}

interface FormattedStatusLabelProps {
  campaignStatus: ITextingCampaignStatuses;
}

const Container = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e0e0e0;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const TextWrapper = styled.div`
  line-height: 50px;
`;

const Text = styled.p`
  width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
`;

const Right = styled.div`
  display: flex;
  gap: 30px;
`;

// 140px is sufficient for longest date-time string
const DateTime = styled.div`
  width: 140px;
`;

// 174px is sufficient for 999,999 recipients
const StatusWrapper = styled.div`
  width: 174px;
  text-align: right;
`;

const statusLabelMinWidth = '76px';

const FormattedStatusLabel = (
  props: FormattedStatusLabelProps
): JSX.Element | null => {
  switch (props.campaignStatus) {
    case 'draft':
      return (
        <StatusLabel
          minWidth={statusLabelMinWidth}
          backgroundColor={colors.adminOrangeIcons}
          text={<FormattedMessage {...messages.draft} />}
        />
      );
    case 'sending':
      return (
        <StatusLabel
          minWidth={statusLabelMinWidth}
          backgroundColor={colors.adminMenuBackground}
          text={<FormattedMessage {...messages.sending} />}
        />
      );
    case 'sent':
      return (
        <StatusLabel
          minWidth={statusLabelMinWidth}
          backgroundColor={colors.clGreenSuccess}
          text={<FormattedMessage {...messages.sent} />}
        />
      );
    case 'failed':
      return (
        <StatusLabel
          minWidth={statusLabelMinWidth}
          backgroundColor={colors.clRedError}
          text={<FormattedMessage {...messages.failed} />}
        />
      );
    default:
      return null;
  }
};

const TextingCampaignRow = ({ campaign }: Props) => {
  const {
    id,
    attributes: { message, phone_numbers, status, sent_at },
  } = campaign;

  return (
    <Container id={id}>
      <Left>
        <TextWrapper>
          <Text>
            <Link to={`/admin/messaging/texting/${id}`}>{message}</Link>
          </Text>
        </TextWrapper>
        <FormattedStatusLabel campaignStatus={status} />
      </Left>
      <Right>
        {status === 'sent' && (
          <>
            <DateTime>
              <FormattedDate value={sent_at} />
              &nbsp;
              <FormattedTime value={sent_at} />
            </DateTime>
            <StatusWrapper>
              <p>
                Sent to {phone_numbers.length.toLocaleString('en-US')}{' '}
                recipients
              </p>
            </StatusWrapper>
          </>
        )}
        {status === 'draft' && (
          <>
            <Button
              linkTo={`/admin/messaging/texting/${campaign.id}`}
              buttonStyle="secondary"
              icon="edit"
            >
              <FormattedMessage {...messages.manageButtonLabel} />
            </Button>
          </>
        )}
      </Right>
    </Container>
  );
};

export default TextingCampaignRow;
