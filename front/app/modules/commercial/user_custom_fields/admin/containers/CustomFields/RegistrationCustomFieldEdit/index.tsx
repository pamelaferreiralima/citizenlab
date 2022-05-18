import React, { memo } from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'utils/withRouter';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import { Outlet as RouterOutlet, useOutletContext } from 'react-router-dom';

// services
import {
  IUserCustomFieldData,
  isBuiltInField,
  IUserCustomFieldInputType,
} from '../../../../services/userCustomFields';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// hooks
import useUserCustomField from '../../../../hooks/useUserCustomField';
import useLocalize from 'hooks/useLocalize';

const StyledGoBackButton = styled(GoBackButton)`
  display: flex;
  margin-bottom: 20px;
`;

type ContextType = { customField: IUserCustomFieldData | null };

export interface Props {
  children: JSX.Element | null;
}

const RegistrationCustomFieldEdit = memo(
  ({
    intl: { formatMessage },
    params: { userCustomFieldId },
  }: Props & WithRouterProps & InjectedIntlProps) => {
    const localize = useLocalize();
    const userCustomField = useUserCustomField(userCustomFieldId);
    const hasOptions = (inputType: IUserCustomFieldInputType) => {
      return inputType === 'select' || inputType === 'multiselect';
    };

    const goBack = () => {
      clHistory.push('/admin/settings/registration');
    };

    const getTabs = (customField: IUserCustomFieldData) => {
      const baseTabsUrl = `/admin/settings/registration/custom-fields/${customField.id}`;

      const tabs = [
        {
          label: formatMessage(messages.fieldSettingsTab),
          url: `${baseTabsUrl}/field-settings`,
          className: 'field-settings',
          name: 'fieldSettings',
        },
      ];

      if (
        hasOptions(customField.attributes.input_type) &&
        !isBuiltInField(customField)
      ) {
        tabs.push({
          label: formatMessage(messages.answerOptionsTab),
          url: `${baseTabsUrl}/options`,
          className: 'options',
          name: 'options',
        });
      }

      return tabs;
    };

    if (!isNilOrError(userCustomField)) {
      return (
        <>
          <StyledGoBackButton onClick={goBack} />
          <TabbedResource
            tabs={getTabs(userCustomField)}
            resource={{
              title: localize(userCustomField.attributes.title_multiloc),
            }}
          >
            {/* todo check to see if this works */}
            <RouterOutlet context={{ customField: userCustomField }} />
          </TabbedResource>
        </>
      );
    }

    return null;
  }
);

// based on the example here https://reactrouter.com/docs/en/v6/hooks/use-outlet-context
export const useUserCustomFieldOutletContext = () => {
  return useOutletContext<ContextType>();
};

export default withRouter(injectIntl(RegistrationCustomFieldEdit));
