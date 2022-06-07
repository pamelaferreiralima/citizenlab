import React, { useState } from 'react';

// components
import { Text, Input } from '@citizenlab/cl2-component-library';

// utils
import { parsePopulationValue } from './utils';

const PopulationInput = () => {
  const [value, setValue] = useState('');

  const handleChange = (value: string) => {
    const formatted = parsePopulationValue(value);
    console.log(formatted);

    if (formatted !== null) {
      setValue(formatted);
    }
  };

  return (
    <>
      <Input type="text" value={value} onChange={handleChange} />
      <Text ml="16px" mr="24px">
        50%
      </Text>
    </>
  );
};

export default PopulationInput;
