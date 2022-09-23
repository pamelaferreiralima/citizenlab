import React, { useRef } from 'react';

// hooks
import useVisitorsData from '../../hooks/useVisitorsData';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import VisitorStats from './VisitorStats';
import Chart from './Chart';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution;
}

const VisitorsCard = ({
  startAtMoment,
  endAtMoment,
  projectFilter,
  resolution,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const graphRef = useRef();
  const { xlsxData } = useVisitorsData();

  const visitorsMessage = formatMessage(messages.visitors);

  return (
    <GraphCard
      title={visitorsMessage}
      infoTooltipContent={formatMessage(messages.titleTooltipMessage)}
      exportMenu={{
        name: visitorsMessage,
        svgNode: graphRef,
        xlsxData: isNilOrError(xlsxData) ? undefined : xlsxData,
        startAt: startAtMoment?.toISOString(),
        endAt: endAtMoment?.toISOString(),
        currentProjectFilter: projectFilter,
        resolution,
      }}
    >
      <Box width="100%" display="flex" flexDirection="row">
        <Box display="flex" flexDirection="row" pl="20px">
          <VisitorStats resolution={resolution} />
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="center">
          <Chart resolution={resolution} innerRef={graphRef} />
        </Box>
      </Box>
    </GraphCard>
  );
};

export default injectIntl(VisitorsCard);
