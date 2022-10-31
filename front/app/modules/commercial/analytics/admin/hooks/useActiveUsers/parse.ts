import { Moment } from 'moment';

// utils
import { getConversionRate } from '../useRegistrations/parse';
import { dateGetter, timeSeriesParser } from '../../utils/timeSeries';

// typings
import {
  Response,
  TimeSeriesResponseRow,
  TimeSeriesRow,
  TimeSeries,
  Stats,
} from './typings';
import { IResolution } from 'components/admin/ResolutionControl';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  activeUsers: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    activeUsers: row.count_dimension_user_id,
    date: getDate(row).format('YYYY-MM-DD'),
  };
};

const getDate = dateGetter<TimeSeriesResponseRow>('dimension_date_created');
const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: TimeSeriesResponseRow[],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution
): TimeSeries | null => {
  return _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
};

export const parseStats = (data: Response['data']): Stats => {
  const activeUsersWholePeriod = data[1][0];
  const activeUsersLastPeriod = data[2][0];
  const visitsWholePeriod = data[3][0];
  const visitsLastPeriod = data[4][0];

  const conversionRateWholePeriod = getConversionRate(
    activeUsersWholePeriod.count_dimension_user_id,
    visitsWholePeriod.count_visitor_id
  );

  const conversionRateLastPeriod = getConversionRate(
    activeUsersLastPeriod.count_dimension_user_id,
    visitsLastPeriod.count_visitor_id
  );

  return {
    activeUsers: {
      value: activeUsersWholePeriod.count_dimension_user_id.toString(),
      lastPeriod: activeUsersLastPeriod.count_dimension_user_id.toString(),
    },
    conversionRate: {
      value: conversionRateWholePeriod,
      lastPeriod: conversionRateLastPeriod,
    },
  };
};
