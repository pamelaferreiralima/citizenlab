import React from 'react';
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'hooks/useAppConfiguration';

// utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { isNilOrError } from 'utils/helperUtils';
import { openSignUpInModal } from 'components/SignUpIn/events';

// style
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

// components
import AvatarBubbles from 'components/AvatarBubbles';
import CityLogoSection from 'components/CityLogoSection';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const FooterBanner = styled.div`
  background: ${({ theme }) => theme.colorMain};
  width: 100%;
  min-height: 300px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 50px;
  padding-bottom: 60px;

  h2 {
    color: #fff;
    font-size: ${fontSizes.xxxl}px;
    line-height: normal;
    font-weight: 600;
    margin-bottom: 30px;
    max-width: 500px;
    text-align: center;

    ${media.smallerThanMaxTablet`
      font-size: ${fontSizes.xxxl}px;
    `}
  }
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  margin-bottom: 45px;
`;

const Footer = () => {
  const authUser = useAuthUser();
  const localize = useLocalize();
  const appConfiguration = useAppConfiguration();

  const signUpIn = (event: React.FormEvent) => {
    event.preventDefault();
    trackEventByName(tracks.clickCreateAccountCTA, {
      extra: { location: 'footer' },
    });
    openSignUpInModal();
  };

  if (!isNilOrError(appConfiguration)) {
    // tranlate header slogan into a h2 wih a fallback
    const headerSloganMultiLoc =
      appConfiguration.data.attributes.settings.core.header_slogan;
    const genericSlogan = (
      <FormattedMessage tagName="h2" {...messages.subtitleCity} />
    );
    const displayHeaderAvatars =
      appConfiguration.data.attributes.settings.core.display_header_avatars;

    return (
      <>
        {!authUser && (
          <FooterBanner>
            {headerSloganMultiLoc ? (
              <h2>{localize(headerSloganMultiLoc)}</h2>
            ) : (
              genericSlogan
            )}
            {displayHeaderAvatars && <StyledAvatarBubbles />}
            <Button
              fontWeight="500"
              padding="13px 22px"
              buttonStyle="primary-inverse"
              onClick={signUpIn}
              text={<FormattedMessage {...messages.createAccount} />}
            />
          </FooterBanner>
        )}
        <CityLogoSection />
      </>
    );
  }

  return null;
};

export default Footer;
