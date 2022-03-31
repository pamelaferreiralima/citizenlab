// DATA
export type Data = { name: string; [key: string]: any }[];

// MAPPING
export interface Mapping {
  length?: string;
  fill?: string;
}

interface ParsedMapping {
  length: string;
  fill?: string;
}

export const parseMapping = (mapping?: Mapping): ParsedMapping => ({
  length: 'value',
  ...mapping,
});

// LAYOUT
export type Layout = 'horizontal' | 'vertical';

// For some reason, in recharts a 'horizontal' bar chart
// actually means a 'vertical' bar chart. For our own API
// we use the correct terminology
export const getRechartsLayout = (layout?: Layout) =>
  layout === 'vertical' ? 'horizontal' : 'vertical';

// BARS
export interface BarProps {
  name?: string;
  size?: number;
  fill?: string;
  opacity?: string | number;
}

interface ParsedBarProps {
  name?: string;
  barSize?: number;
  fill: string;
  opacity?: string | number;
}

export const parseBarProps = (
  defaultFill: string,
  barProps?: BarProps
): ParsedBarProps => {
  const defaultBarProps = { fill: defaultFill };
  if (!barProps) return defaultBarProps;

  const { size, ...otherBarProps } = barProps;
  return { ...defaultBarProps, barSize: size, ...otherBarProps };
};
