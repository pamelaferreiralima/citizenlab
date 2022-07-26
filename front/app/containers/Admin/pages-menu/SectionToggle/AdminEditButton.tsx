import React from 'react';
// should we always use Button from this folder? when do we use the one from the component library? */
import Button from 'components/UI/Button';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  onClick: () => void;
  testId?: string;
}

// to be moved to a general component folder (+ refactor existing buttons using this?)

const AdminEditButton = ({ onClick, testId }: Props) => {
  return (
    <Button buttonStyle="secondary" icon="edit" onClick={onClick}
      data-testid={`admin-edit-button-${testId}`}
    >
      <FormattedMessage {...messages.edit} />
    </Button>
  );
};

export default AdminEditButton;
