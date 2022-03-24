import { Button, ButtonProps } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import React, { ReactNode } from 'react';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

const MethodButton = styled(Button)<{ last: boolean }>`
  margin-bottom: ${({ last }) => (last ? '0px' : '15px')};
`;

interface Props extends Partial<ButtonProps> {
  children: ReactNode;
  last: boolean;
}

const VerificationMethodButton = (props: Props) => {
  const locale = useLocale();
  if (isNilOrError(locale)) return null;

  return (
    <MethodButton
      icon="shieldVerified"
      iconSize="22px"
      buttonStyle="white"
      fullWidth={true}
      justify="left"
      whiteSpace="wrap"
      locale={locale}
      {...props}
    >
      {props.children}
    </MethodButton>
  );
};

export default VerificationMethodButton;
