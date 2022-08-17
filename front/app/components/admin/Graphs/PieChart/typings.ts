import { RefObject } from 'react';
import { NilOrError } from 'utils/helperUtils';
import { Percentage } from 'typings';
import { Margin, TooltipProps, KeyOfType, Cell } from '../typings';
import { Payload } from '../BarChart/typings';

// PROPS
export interface Props<Row> {
  width?: Percentage | number;
  height?: Percentage | number;
  data: Row[] | NilOrError;
  mapping: Mapping<Row>;
  pie?: Pie;
  margin?: Margin;
  annotations?: boolean | ((row: Row) => string);
  tooltip?: TooltipProps;
  centerLabel?: React.ReactElement;
  emptyContainerContent?: React.ReactNode;
  innerRef?: RefObject<any>;
  onMouseOver?: (payload: Payload<Row>, event: React.MouseEvent) => void;
  onMouseOut?: (payload: Payload<Row>, event: React.MouseEvent) => void;
}

export interface Mapping<Row> {
  name: KeyOfType<Row, string>;
  angle: KeyOfType<Row, number>;
  fill?: (payload: Payload<Row>) => string;
  opacity?: (payload: Payload<Row>) => number;
}

export interface Pie {
  isAnimationActive?: boolean;
  innerRadius?: Percentage | number;
  outerRadius?: Percentage | number;
  startAngle?: number;
  endAngle?: number;
}

// PARSED CONFIG
export interface PieConfig {
  props: {
    nameKey: string;
    dataKey: string;
    isAnimationActive?: boolean;
    innerRadius?: number | string;
    outerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    label?: any;
  };
  cells: Cell[];
}
