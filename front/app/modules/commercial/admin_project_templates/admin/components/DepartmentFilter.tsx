import React, { memo, useCallback, useState } from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

// graphql
import { gql, useQuery } from '@apollo/client';
import { client } from '../../utils/apolloUtils';

// components
import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

interface Props {
  onChange: (value: string[]) => void;
}

const DepartmentFilter = memo<Props & WrappedComponentProps>(
  ({ intl: { formatMessage }, onChange }) => {
    const localize = useLocalize();
    const graphqlTenantLocales = useGraphqlTenantLocales();

    const DEPARTMENTS_QUERY = gql`
    {
      departments {
        nodes {
          id
          titleMultiloc {
            ${graphqlTenantLocales}
          }
        }
      }
    }
  `;

    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const { data } = useQuery(DEPARTMENTS_QUERY, { client });

    let options: IFilterSelectorValue[] = [];

    if (data) {
      options = data.departments.nodes.map((node) => ({
        value: node.id,
        text: localize(node.titleMultiloc),
      }));
    }

    const handleOnChange = useCallback((selectedValues: string[]) => {
      setSelectedValues(selectedValues);
      onChange(selectedValues);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <FilterSelector
        title={formatMessage(messages.departments)}
        name={formatMessage(messages.departments)}
        selected={selectedValues}
        values={options}
        onChange={handleOnChange}
        multipleSelectionAllowed={true}
        last={false}
        left="-5px"
        mobileLeft="-5px"
      />
    );
  }
);

export default injectIntl(DepartmentFilter);
