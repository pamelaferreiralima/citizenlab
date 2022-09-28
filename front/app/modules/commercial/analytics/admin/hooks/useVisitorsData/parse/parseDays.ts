import { Moment } from 'moment';
import {
  indexTimeSeries,
  getFirstDateInData,
  getLastDateInData,
  getEmptyRow,
  dateRange,
} from './utils';
import { TimeSeriesResponse } from '../typings';

export const parseDays = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined
) => {
  const indexedTimeSeries = indexTimeSeries(responseTimeSeries);

  const firstDateInData = getFirstDateInData(responseTimeSeries);
  const lastDateInData = getLastDateInData(responseTimeSeries);

  const startDay = startAtMoment ?? firstDateInData;
  const endDay = endAtMoment ?? lastDateInData;

  const days = dateRange(startDay, endDay, 'day');
  if (days === null) return null;

  return days.map((day) => {
    const currentDayISO = day.toISOString();
    const row = indexedTimeSeries.get(currentDayISO);

    return row ?? getEmptyRow(day);
  });
};
