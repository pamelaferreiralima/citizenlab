import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const Cell = ({ children }: Props) => <Box as="td">{children}</Box>;

export default Cell;
