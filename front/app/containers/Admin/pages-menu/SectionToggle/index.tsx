import React from 'react';
import styled from 'styled-components';
// components
import {
  IconTooltip,
  Toggle,
  Box,
  Title,
} from '@citizenlab/cl2-component-library';
import { Row } from 'components/admin/ResourceList';
import AdminEditButton from './AdminEditButton';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

const StyledToggle = styled(Toggle)`
  margin-right: 20px;
`;

export interface Props {
  onChangeSectionToggle: () => void;
  onClickEditButton?: () => void;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  checked: boolean;
}

const SectionToggle = ({
  onChangeSectionToggle,
  onClickEditButton,
  titleMessageDescriptor,
  tooltipMessageDescriptor,
  checked,
}: Props) => {
  return (
    <Row>
      <Box display="flex" alignItems="center">
        <StyledToggle checked={checked} onChange={onChangeSectionToggle} />
        {/*
      Note: I think we want a default font-weigt of 600, not 700 for this component.
      Also, the margin-top is more than margin-bottom (for an h3).
      */}
        <Title variant="h3" mr="10px">
          <FormattedMessage {...titleMessageDescriptor} />
        </Title>
        <IconTooltip
          content={<FormattedMessage {...tooltipMessageDescriptor} />}
        />
      </Box>
      {onClickEditButton && <AdminEditButton onClick={onClickEditButton} />}
    </Row>
  );
};

export default SectionToggle;
