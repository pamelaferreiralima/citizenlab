import React from 'react';
import { clickSocialSharingLink } from './';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  className?: string;
  onClick: () => void;
  children: JSX.Element | JSX.Element[];
  emailSubject?: string;
  emailBody?: string;
}

const Email = ({
  children,
  onClick,
  className,
  emailSubject,
  emailBody,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    onClick();
  };

  const href =
    emailSubject && emailBody
      ? `mailto:?subject=${emailSubject}&body=${emailBody}`
      : null;

  if (href) {
    return (
      <button
        className={className}
        onClick={handleClick(href)}
        aria-label={formatMessage(messages.shareByEmail)}
      >
        {children}
      </button>
    );
  }

  return null;
};

export default injectIntl(Email);
