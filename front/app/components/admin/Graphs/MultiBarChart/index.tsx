import React from 'react';

// styling
import { colors, sizes, animation } from 'components/admin/Graphs/styling';

// components
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { NoDataContainer } from 'components/admin/GraphWrappers';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { getCategories, getRechartsLayout } from './utils';
import { hasNoData } from '../utils';

// typings
import { Props } from './typings';

const MultiBarChart = <T,>({
  width,
  height,
  data,
  mapping,
  bars,
  layout = 'vertical',
  margin,
  xaxis,
  yaxis,
  renderLabels,
  renderTooltip,
  emptyContainerContent,
  className,
  innerRef,
}: Props<T>) => {
  if (hasNoData(data)) {
    return (
      <NoDataContainer>
        {emptyContainerContent ? (
          <>{emptyContainerContent}</>
        ) : (
          <FormattedMessage {...messages.noData} />
        )}
      </NoDataContainer>
    );
  }

  const categories = getCategories(data, mapping, bars);
  const rechartsLayout = getRechartsLayout(layout);
  const labelPosition = layout === 'vertical' ? 'top' : 'right';

  return (
    <ResponsiveContainer className={className} width={width} height={height}>
      <RechartsBarChart
        data={data}
        layout={rechartsLayout}
        margin={margin}
        ref={innerRef}
        barGap={0}
        barCategoryGap={bars?.categoryGap}
      >
        {renderTooltip &&
          renderTooltip({
            isAnimationActive: false,
            cursor: { fill: colors.barHover },
          })}

        {categories.map((category, categoryIndex) => (
          <Bar
            key={categoryIndex}
            animationDuration={animation.duration}
            animationBegin={animation.begin}
            {...category}
          >
            {renderLabels &&
              renderLabels({
                fill: colors.chartLabel,
                fontSize: sizes.chartLabel,
                position: labelPosition,
              })}

            {category.cells &&
              category.cells.map((cell, cellIndex) => (
                <Cell key={`cell-${categoryIndex}-${cellIndex}`} {...cell} />
              ))}
          </Bar>
        ))}

        <XAxis
          dataKey={layout === 'vertical' ? 'name' : undefined}
          type={layout === 'vertical' ? 'category' : 'number'}
          stroke={colors.chartLabel}
          fontSize={sizes.chartLabel}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          dataKey={layout === 'horizontal' ? 'name' : undefined}
          type={layout === 'horizontal' ? 'category' : 'number'}
          stroke={colors.chartLabel}
          fontSize={sizes.chartLabel}
          {...yaxis}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default MultiBarChart;
