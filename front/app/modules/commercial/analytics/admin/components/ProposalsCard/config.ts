import messages from './messages';

// Utils
import {
  getTimePeriodMoment,
  getTimePeriodTranslationByResolution,
} from '../../utils/resolution';
import { formatCountValue } from '../../utils/parse';
import { getDateFilter, getProjectFilter } from '../../utils/query';

// Typings
import {
  StatCardChartData,
  StatCardProps,
  StatCardConfig,
} from '../../hooks/useStatCard/typings';
import { Query, QuerySchema } from '../../services/analyticsFacts';
import moment, { Moment } from 'moment';
import { WrappedComponentProps } from 'react-intl';
import { underscoreCase } from '../../hooks/useStatCard/parse';

export const proposalsConfig: StatCardConfig = {
  // Card title
  title: messages.proposals,

  // Create the data object
  dataParser: (
    responseData,
    formatMessage: WrappedComponentProps['intl']['formatMessage'],
    resolution
  ): StatCardChartData => {
    const [total, totalPeriod, successful, successfulPeriod] = responseData;
    return {
      cardTitle: formatMessage(messages.proposals),
      fileName: underscoreCase(formatMessage(messages.proposals)),
      periodLabel: getTimePeriodTranslationByResolution(
        formatMessage,
        resolution
      ),
      stats: [
        {
          label: formatMessage(messages.totalProposals),
          value: formatCountValue(total[0].count),
          lastPeriod: formatCountValue(totalPeriod[0].count),
        },
        {
          label: formatMessage(messages.successfulProposals),
          value: formatCountValue(successful[0].count),
          lastPeriod: formatCountValue(successfulPeriod[0].count),
          toolTip: formatMessage(messages.successfulProposalsToolTip),
        },
      ],
    };
  },

  // Analytics API query
  queryHandler: ({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  }: StatCardProps): Query => {
    const todayMoment = moment();
    const lastPeriodMoment = getTimePeriodMoment(resolution);

    const queryBase = (
      startMoment: Moment | null | undefined,
      endMoment: Moment | null,
      successful = false
    ): QuerySchema => {
      const successStatus = () => {
        return successful
          ? { 'dimension_status.code': 'threshold_reached' }
          : {};
      };
      return {
        fact: 'post',
        aggregations: {
          all: 'count',
        },
        filters: {
          'dimension_type.name': 'initiative',
          ...successStatus,
          ...getProjectFilter('dimension_project', projectId),
          ...getDateFilter('dimension_date_created', startMoment, endMoment),
        },
      };
    };

    const queryAll: QuerySchema = queryBase(startAtMoment, endAtMoment);
    const queryAllLastPeriod: QuerySchema = queryBase(
      lastPeriodMoment,
      todayMoment
    );
    const querySuccessful: QuerySchema = queryBase(
      startAtMoment,
      endAtMoment,
      true
    );
    const querySuccessfulLastPeriod: QuerySchema = queryBase(
      lastPeriodMoment,
      todayMoment,
      true
    );

    return {
      query: [
        queryAll,
        queryAllLastPeriod,
        querySuccessful,
        querySuccessfulLastPeriod,
      ],
    };
  },
};
