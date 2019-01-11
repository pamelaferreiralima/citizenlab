import React from 'react';
import messages from './messages';

import { FormattedMessage } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import { ButtonContainer } from './Container';
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

export default ({ validate, isCancelling, handleCancelBack, handleCancelConfirm, handleCancel, handleSave }) => {
  const isValid = validate();
  return (
  isCancelling ? (
    <ButtonContainer>
      <Button onClick={handleCancelBack} style="primary-inverse" textColor={colors.adminTextColor}>
        <FormattedMessage {...messages.back} />
      </Button>
      <Button onClick={handleCancelConfirm} style="primary" bgColor={colors.adminTextColor} bgHoverColor={darken(0.1, colors.adminTextColor)}>
        <FormattedMessage {...messages.confirm} />
      </Button>
    </ButtonContainer>
  ) : (
      <ButtonContainer>
        <Button onClick={handleCancel} className="integration-cancel" style="primary-inverse" textColor={colors.adminTextColor}>
          <FormattedMessage {...messages.cancel} />
        </Button>
        <Button
          onClick={handleSave}
          style="primary"
          bgColor={colors.adminTextColor}
          bgHoverColor={darken(0.1, colors.adminTextColor)}
          className="integration-save"
          disabled={!isValid}
        >
          <FormattedMessage  {...messages.save} />
        </Button>
      </ButtonContainer>
    )
);
}
