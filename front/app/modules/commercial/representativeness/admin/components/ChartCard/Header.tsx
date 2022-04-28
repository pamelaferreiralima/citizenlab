import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import {
  Box,
  Title,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import RepresentativenessArticleLink from '../RepresentativenessArticleLink';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { Multiloc } from 'typings';

interface Props {
  titleMultiloc: Multiloc;
  svgNode: React.RefObject<SVGElement | undefined>;
  representativenessScore: number;
}

const Header = ({ titleMultiloc, svgNode, representativenessScore }: Props) => {
  const localize = useLocalize();
  const title = localize(titleMultiloc);

  return (
    <Box
      p="20px 40px 0px 40px"
      mb="12px"
      display="flex"
      justifyContent="space-between"
    >
      <Title variant="h3" as="h2">
        {title}
      </Title>
      <Box display="flex" alignItems="center" mt="4px">
        <Text
          fontSize="s"
          color="adminSecondaryTextColor"
          fontWeight="bold"
          display="inline"
          m="0px"
          mr="8px"
          mb="0px"
        >
          <FormattedMessage {...messages.representativenessScoreText} />
        </Text>

        <Text
          fontSize="xxl"
          display="inline"
          color="adminTextColor"
          fontWeight="bold"
          m="0px"
          mb="0px"
        >
          {representativenessScore}
        </Text>

        <Text
          fontSize="xxl"
          display="inline"
          color="mediumGrey"
          m="0px"
          mr="8px"
          mb="0px"
        >
          /100
        </Text>
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.representativenessScoreTooltipText}
              values={{
                representativenessArticleLink: (
                  <RepresentativenessArticleLink />
                ),
              }}
            />
          }
          mr="12px"
        />
        <ReportExportMenu name={title} svgNode={svgNode} />
      </Box>
    </Box>
  );
};

export default Header;
