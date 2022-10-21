// utils
import { roundPercentage } from 'utils/math';

// typings
import { ReferrerRow, ReferrersTotalRow, TableRow } from './typings';
import { Translations } from './translations';

export const parseTableData = (
  referrerRows: ReferrerRow[],
  { count: totalVisits, count_visitor_id: totalVisitors }: ReferrersTotalRow,
  translations: Translations
): TableRow[] | null => {
  if (referrerRows.length === 0) return null;
  if (!totalVisits || !totalVisitors) return null;

  return referrerRows.map((row) => ({
    visits: row.count,
    visitsPercentage: roundPercentage(row.count, totalVisits),
    visitors: row.count_visitor_id,
    visitorsPercentage: roundPercentage(row.count_visitor_id, totalVisitors),
    referrerType:
      row['dimension_referrer_type.name'] in translations
        ? translations[row['dimension_referrer_type.name']]
        : row['dimension_referrer_type.name'],
    referrer: row.referrer_name ?? '',
  }));
};
