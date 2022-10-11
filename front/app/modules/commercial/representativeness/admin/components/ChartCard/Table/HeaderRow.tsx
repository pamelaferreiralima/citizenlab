import React from 'react';

// components
import { Header, Row, HeaderCell } from 'components/admin/Table';
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from '@citizenlab/cl2-component-library';

// utils
import { roundPercentage } from 'utils/math';

interface Props {
  columns: string[];
}

const HeaderRow = ({ columns }: Props) => (
  <Header background={colors.grey50}>
    <Row>
      {columns.map((column, i) => (
        <HeaderCell width={`${roundPercentage(1, columns.length)}%`} key={i}>
          <Box my="6px">{column}</Box>
        </HeaderCell>
      ))}
    </Row>
  </Header>
);

export default HeaderRow;
