import React from 'react';

// services
import { IInviteData, deleteInvite } from 'services/invites';

// hooks
import useUser from 'hooks/useUser';

// components
import { Table, Button as SemanticButton, Popup } from 'semantic-ui-react';
import { Badge } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  invite: IInviteData;
}

const Row = (inputProps: InputProps) => {
  const userId = inputProps.invite.relationships.invitee.data.id;
  const user = useUser({ userId });

  const handleOnDeleteInvite = () => {
    const inviteId = inputProps.invite.id;
    deleteInvite(inviteId);
  };

  if (isNilOrError(user)) return null;

  return (
    // To test invitation flow, we need the token, hence this className
    <Table.Row
      key={inputProps.invite.id}
      className={inputProps.invite.attributes.token}
    >
      <Table.Cell>{user.attributes.email}</Table.Cell>
      <Table.Cell>
        <span>
          {user.attributes.first_name} {user.attributes.last_name}
        </span>
      </Table.Cell>
      <Table.Cell>
        <FormattedDate value={inputProps.invite.attributes.created_at} />
      </Table.Cell>
      <Table.Cell textAlign="center">
        {user.attributes.invite_status === 'pending' ? (
          <Badge>
            <FormattedMessage {...messages.inviteStatusPending} />
          </Badge>
        ) : (
          <Badge color={colors.success}>
            <FormattedMessage {...messages.inviteStatusAccepted} />
          </Badge>
        )}
      </Table.Cell>
      <Table.Cell textAlign="center">
        <Popup
          trigger={<SemanticButton icon="trash" />}
          content={
            <SemanticButton
              color="red"
              content={<FormattedMessage {...messages.confirmDelete} />}
              onClick={handleOnDeleteInvite}
            />
          }
          on="click"
          position="bottom right"
        />
      </Table.Cell>
    </Table.Row>
  );
};

export default Row;
