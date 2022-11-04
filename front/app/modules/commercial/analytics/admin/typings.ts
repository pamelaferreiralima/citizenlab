import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';
import { BoxProps } from '@citizenlab/cl2-component-library';

// Parameters
export interface ProjectId {
  projectId: string | undefined;
}

export interface Dates {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
}

export interface Resolution {
  resolution: IResolution;
}

export interface Pagination {
  pageSize: number;
  pageNumber: number;
}

// Hook return values
export interface Stat {
  value: string;
  lastPeriod: string;
}

// Component layouts
export type Layout = 'wide' | 'narrow';
export type BoxLayout = Record<Layout, BoxProps>;
