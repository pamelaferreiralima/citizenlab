import React from 'react';
import styled from 'styled-components';

// Components
import { Icon, IconNames, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

import { colors } from 'utils/styleUtils';

interface Props {
  label: string;
  icon: IconNames;
  onClick: () => void;
}

const AddIcon = styled(Icon).attrs({ name: 'plus', ml: '20px' })`
  width: 16px;
  height: 16px;
  fill: ${colors.adminSecondaryTextColor};
`;

const StyledButton = styled(Button)`
  ${AddIcon} {
    visibility: hidden;
  }
  &:hover {
    background-color: ${colors.emailBg};
    transition: background-color 80ms ease-out 0s;
  }
  &:last-child:hover ${AddIcon} {
    visibility: visible;
  }
`;

const ToolboxItem = ({ icon, label, onClick }: Props) => {
  return (
    <StyledButton
      buttonStyle="text"
      onClick={onClick}
      icon={icon}
      iconColor={colors.adminTextColor}
      iconSize="20px"
      width="100%"
      m="0px"
      px="0px"
    >
      <Text color="text" as="span">
        {label}
      </Text>
      <AddIcon />
    </StyledButton>
  );
};

export default ToolboxItem;