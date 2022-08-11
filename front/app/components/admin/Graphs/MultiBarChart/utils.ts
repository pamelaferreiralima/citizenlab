// styling
import { colors } from '../styling';

// typings
import { Mapping, Bars, BarConfig, Layout } from './typings';

const FALLBACKS = {
  fill: colors.barFill,
};

export const getBarConfigs = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  bars?: Bars
) => {
  const { category, length, fill, opacity } = mapping;

  const barConfigs: BarConfig[] = length.map((lengthColumn, categoryIndex) => {
    const cells = data.map((row, rowIndex) => ({
      fill:
        (fill && colors[fill(row, rowIndex)[categoryIndex]]) ?? FALLBACKS.fill,
      opacity: opacity && opacity(row, rowIndex)[categoryIndex],
    }));

    return {
      props: {
        name: category as string,
        dataKey: lengthColumn as string,
        isAnimationActive: bars?.isAnimationActive,
        barSize: bars?.size,
      },
      cells,
    };
  });

  return barConfigs;
};

// For some reason, in recharts a 'horizontal' bar chart
// actually means a 'vertical' bar chart. For our own API
// we use the correct terminology
export const getRechartsLayout = (layout: Layout) =>
  layout === 'vertical' ? 'horizontal' : 'vertical';
