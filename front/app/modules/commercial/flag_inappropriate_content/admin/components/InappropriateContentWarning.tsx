import React from 'react';
import styled from 'styled-components';
import { Icon, colors } from 'cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// services
import { getFlagType } from '../../services/inappropriateContentFlags';

// hooks
import useInappropriateContentFlag from '../../hooks/useInappropriateContentFlag';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const WarningContent = styled.div`
  color: ${colors.clRedError};
  font-weight: bold;
`;

const WarningIcon = styled(Icon)`
  color: ${colors.clRedError};
  margin-right: 5px;
  width: 16px;
`;

interface Props {
  inappropriateContentFlagId: string;
}

const InappropriateContentWarning = ({
  inappropriateContentFlagId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const inappropriateContentFlag = useInappropriateContentFlag(
    inappropriateContentFlagId
  );

  if (!isNilOrError(inappropriateContentFlag)) {
    const flagType = getFlagType(inappropriateContentFlag);

    return (
      <Container>
        <WarningIcon name="exclamation-trapezium" />
        <WarningContent>
          {
            {
              nlp_flagged: formatMessage(messages.nlpFlaggedWarningText),
              user_flagged: formatMessage(messages.userFlaggedWarningText),
            }[flagType]
          }
        </WarningContent>
      </Container>
    );
  }

  return null;
};

export default injectIntl(InappropriateContentWarning);
