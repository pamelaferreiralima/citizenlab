import React from 'react';
import styled from 'styled-components';

// components
import { Table } from 'semantic-ui-react';
import { Box /*Icon*/ } from '@citizenlab/cl2-component-library';
import HeaderRow from './HeaderRow';
import Row from './Row';
import Button from 'components/UI/Button';

// styling
import { fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { RepresentativenessData } from '..';

const TABLE_HEADER_BG_COLOR = '#f9fafb';

const StyledBody = styled(Table.Body)`
  td:first-child {
    background-color: ${TABLE_HEADER_BG_COLOR};
  }
`;

interface Props {
  data: RepresentativenessData;
  legendLabels: string[];
}

const TableComponent = ({
  data,
  legendLabels,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const columns = [formatMessage(messages.item), ...legendLabels];
  const slicedData = data.slice(0, 12);

  return (
    <>
      <Box mx="40px" my="20px">
        <Table>
          <HeaderRow columns={columns} />
          <StyledBody>
            {slicedData.map((row, i) => (
              <Row row={row} key={i} />
            ))}
          </StyledBody>
        </Table>
      </Box>

      <Button
        buttonStyle="secondary"
        width="160px"
        ml="40px"
        fontSize={`${fontSizes.s}px`}
      >
        Show 23 more
        {/* <Icon name="" /> */}
      </Button>
    </>
  );
};

export default injectIntl(TableComponent);
