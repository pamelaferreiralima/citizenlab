import Button from 'components/UI/Button';
import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  linkTo: string;
}

const ViewCustomPageButton = ({
  linkTo,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <Button
      buttonStyle="cl-blue"
      icon="eye"
      id="to-custom-page"
      openLinkInNewTab
      linkTo={linkTo}
    >
      {formatMessage(messages.viewCustomPage)}
    </Button>
  );
};

export default injectIntl(ViewCustomPageButton);
