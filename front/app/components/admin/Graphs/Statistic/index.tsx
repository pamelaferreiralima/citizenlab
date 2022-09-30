import React from 'react';

// components
import {
  Box,
  Text,
  Icon,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// styling
import { colors, fontSizes } from 'utils/styleUtils';

interface Props {
  name: string;
  value: string;
  bottomLabel?: string;
  bottomLabelValue?: string;
  tooltipContent?: React.ReactChild;
  emptyTooltipContent?: React.ReactNode;
}

const Statistic = ({
  name,
  value,
  bottomLabel,
  bottomLabelValue,
  tooltipContent,
  emptyTooltipContent,
}: Props) => (
  <Box>
    <Box>
      <Text color="primary" fontSize="s" mt="0px" mb="0px" display="inline">
        {name}
      </Text>

      {tooltipContent && (
        <Box ml="8px" display="inline">
          <IconTooltip
            content={tooltipContent}
            theme="light"
            transform="translate(0,-2)"
          />
        </Box>
      )}

      {emptyTooltipContent && (
        <Box ml="8px" display="inline">
          <Tippy
            interactive={true}
            content={emptyTooltipContent}
            placement="top"
            theme="light"
          >
            <Box display="inline">
              <Icon
                name="error"
                width={`${fontSizes.s}px`}
                height={`${fontSizes.s}px`}
                fill={colors.teal300}
                transform="translate(0,-1)"
              />
            </Box>
          </Tippy>
        </Box>
      )}
    </Box>

    <Text color="textPrimary" fontSize="xl" mt="2px" mb="0px">
      {value}
    </Text>
    {bottomLabel && (
      <Box mt="3px">
        <Text
          color="textSecondary"
          fontSize="s"
          mt="0px"
          mb="0px"
          display="inline"
        >
          {bottomLabel}
        </Text>

        {bottomLabelValue && (
          <Text
            color="textSecondary"
            display="inline"
            fontWeight="bold"
            fontSize="s"
            mt="0px"
            mb="0px"
            ml="4px"
          >
            {bottomLabelValue}
          </Text>
        )}
      </Box>
    )}
  </Box>
);

export default Statistic;
