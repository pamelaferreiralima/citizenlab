import { XlsxData } from 'components/admin/ReportExportMenu';
import { ChartData } from './typings';

export const parseChartData = (
  all,
  allPeriod,
  successful,
  successfulPeriod
): ChartData => {
  return {
    totalProposals: {
      value: formatValue(all[0].count),
      lastPeriod: formatValue(allPeriod[0].count),
    },
    successfulProposals: {
      value: formatValue(successful[0].count),
      lastPeriod: formatValue(successfulPeriod[0].count),
    },
  };
};

// Replace zeroes with '-' by convention & return strings
const formatValue = (count: number): string => {
  if (count === 0) return '-';
  return count.toString();
};

export const parseExcelData = (
  all,
  allPeriod,
  successful,
  successfulPeriod,
  labels
): XlsxData => {
  const data = parseChartData(all, allPeriod, successful, successfulPeriod);

  const xlsxDataSheet1 = {
    [labels.total]: data.totalProposals.value,
    [`${labels.total}_${labels.period}`]: data.totalProposals.lastPeriod,
    [`${labels.successful}`]: data.successfulProposals.value,
    [`${labels.successful}_${labels.period}`]:
      data.successfulProposals.lastPeriod,
  };

  const xlsxData = {
    [labels.cardTitle]: [xlsxDataSheet1],
  };

  return xlsxData;
};
