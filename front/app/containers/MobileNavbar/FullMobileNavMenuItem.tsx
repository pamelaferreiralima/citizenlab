import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  linkTo: string;
  linkMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  onClick: () => void;
}

const MenuItem = styled.li`
  font-size: ${fontSizes.base}px;
  display: flex;
  justify-content: center;
`;

const StyledLink = styled(Link)`
  color: ${colors.text};
  padding: 20px 10px;
  border-radius: 5px;

  &:hover {
    color: ${darken(0.2, colors.text)};
  }

  &:active {
    background: ${darken(0.05, '#fff')};
  }
`;

const FullMobileNavMenuItem = ({
  linkTo,
  linkMessage,
  onClick,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <MenuItem>
      <StyledLink onClick={onClick} to={linkTo}>
        {formatMessage(linkMessage)}
      </StyledLink>
    </MenuItem>
  );
};

export default injectIntl(FullMobileNavMenuItem);
