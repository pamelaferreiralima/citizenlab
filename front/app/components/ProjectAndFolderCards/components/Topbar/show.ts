import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';
import { IAreaData } from 'services/areas';

export const getShowTabs = (statusCounts: IStatusCounts) =>
  statusCounts.all > 0;

export const getShowFilters = (
  smallerThanXlPhone: boolean,
  hasPublications: boolean,
  statusCounts: IStatusCounts,
  selectedTopics: string[],
  selectedAreas: string[]
) => {
  if (selectedAreas.length > 0 || selectedTopics.length > 0) {
    return true;
  }

  return smallerThanXlPhone ? hasPublications : statusCounts.all > 0;
};

export const getShowFiltersLabel = (
  topics: ITopicData[] | NilOrError,
  areas: IAreaData[] | NilOrError,
  smallerThanMinTablet: boolean
) => {
  return (
    !(
      (isNilOrError(topics) || topics.length === 0) &&
      (isNilOrError(areas) || areas.length === 0)
    ) && !smallerThanMinTablet
  );
};
