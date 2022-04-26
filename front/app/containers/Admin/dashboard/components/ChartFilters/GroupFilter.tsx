import React from 'react';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

// hooks
import useLocalize, { Localize } from 'hooks/useLocalize';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';
import { IGroupData } from 'services/groups';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  groups: GetGroupsChildProps;
}

interface InputProps {
  width?: string;
  currentGroupFilter?: string | null;
  onGroupFilter: (filter: IOption) => void;
}

interface Props extends DataProps, InputProps {}

const generateGroupOptions = (
  groupsList: IGroupData[],
  localize: Localize,
  formatMessage: InjectedIntlProps['intl']['formatMessage']
) => {
  const groupOptions = groupsList.map((group) => ({
    value: group.id,
    label: localize(group.attributes.title_multiloc),
  }));

  return [
    { value: '', label: formatMessage(messages.allGroups) },
    ...groupOptions,
  ];
};

const GroupFilter = ({
  groups: { groupsList },
  width,
  currentGroupFilter,
  onGroupFilter,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const localize = useLocalize();

  if (isNilOrError(groupsList)) return null;

  const groupFilterOptions = generateGroupOptions(
    groupsList,
    localize,
    formatMessage
  );

  return (
    <Box width={width || '32%'}>
      <Select
        id="groupFilter"
        label={<FormattedMessage {...messages.labelGroupFilter} />}
        onChange={onGroupFilter}
        value={currentGroupFilter || ''}
        options={groupFilterOptions}
      />
    </Box>
  );
};

const GroupFilterWithIntl = injectIntl(GroupFilter);

export default (props: InputProps) => (
  <GetGroups>
    {(groups) => <GroupFilterWithIntl groups={groups} {...props} />}
  </GetGroups>
);
