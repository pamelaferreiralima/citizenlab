import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// typings
import { IParticipationContextType } from 'typings';

// services
import {
  getIdeaPostingRules,
  IIdeaPostingDisabledReason,
} from 'services/actionTakingRules';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// components
import Button, { ButtonContainerProps } from 'components/UI/Button';
import Tippy from '@tippyjs/react';
import { Icon } from 'cl2-component-library';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { openSignUpInModal } from 'components/SignUpIn/events';

// events
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { LatLng } from 'leaflet';

const Container = styled.div``;

const ButtonWrapper = styled.div``;

const TooltipContent = styled.div<{ inMap?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.inMap ? '0px' : '15px')};
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 25px;
  width: 20px;
  height: 25px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  a,
  button {
    color: ${colors.clBlueDark};
    font-size: ${fontSizes.base}px;
    line-height: normal;
    font-weight: 400;
    text-align: left;
    text-decoration: underline;
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;
    display: inline;
    padding: 0px;
    margin: 0px;
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }
`;

interface DataProps {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps extends Omit<ButtonContainerProps, 'onClick'> {
  projectId?: string | undefined | null;
  phaseId?: string | undefined | null;
  latLng?: LatLng | null;
  inMap?: boolean;
  className?: string;
  participationContextType: IParticipationContextType | null;
}

interface Props extends InputProps, DataProps {}

const IdeaButton = memo<Props & InjectedIntlProps>(
  ({
    project,
    phase,
    authUser,
    participationContextType,
    phaseId,
    projectId,
    inMap,
    className,
    latLng,
    intl: { formatMessage },
    ...buttonContainerProps
  }) => {
    const disabledMessages: {
      [key in IIdeaPostingDisabledReason]: ReactIntl.FormattedMessage.MessageDescriptor;
    } = {
      notPermitted: messages.postingNotPermitted,
      postingDisabled: messages.postingHereImpossible,
      projectInactive: messages.postingProjectInactive,
      futureEnabled: messages.postingHereNotYetPossible,
      notActivePhase: messages.postingNotActivePhase,
      maybeNotPermitted: messages.postingMaybeNotPermitted,
    };

    const { show, enabled, disabledReason, action } = getIdeaPostingRules({
      project,
      phase,
      authUser,
    });

    const onClick = (event: React.FormEvent<HTMLButtonElement>) => {
      event.preventDefault();

      trackEventByName(tracks.postYourIdeaButtonClicked);

      // if not logged in
      if (action === 'sign_in_up' || 'sign_in_up_and_verify') {
        signUp();
      }

      // if logged in but not verified and verification required
      if (action === 'verify') {
        verify();
      }

      // if logegd in and posting allowed
      if (enabled === true) {
        redirectToIdeaForm();
      }
    };

    const redirectToIdeaForm = () => {
      if (!isNilOrError(project)) {
        trackEventByName(tracks.redirectedToIdeaFrom);

        clHistory.push({
          pathname: `/projects/${project.attributes.slug}/ideas/new`,
          search: latLng
            ? stringify(
                { lat: latLng.lat, lng: latLng.lng },
                { addQueryPrefix: true }
              )
            : undefined,
        });
      }
    };

    const verify = (event?: React.MouseEvent) => {
      event?.preventDefault();

      const pcType = participationContextType;
      const pcId = pcType === 'phase' ? phaseId : projectId;

      if (pcId && pcType) {
        trackEventByName(tracks.verificationModalOpened);
        openVerificationModal({
          context: {
            action: 'posting_idea',
            id: pcId,
            type: pcType,
          },
        });
      }
    };

    const signIn = (event?: React.MouseEvent) => {
      signUpIn('signin')(event);
    };

    const signUp = (event?: React.MouseEvent) => {
      signUpIn('signup')(event);
    };

    const signUpIn = (flow: 'signup' | 'signin') => (
      event?: React.MouseEvent
    ) => {
      event?.preventDefault();

      const pcType = participationContextType;
      const pcId = pcType === 'phase' ? phaseId : projectId;

      const shouldVerify = action === 'sign_in_up_and_verify';

      if (isNilOrError(authUser) && !isNilOrError(project)) {
        trackEventByName(tracks.signUpInModalOpened);
        openSignUpInModal({
          flow,
          verification: shouldVerify,
          verificationContext: !!(shouldVerify && pcId && pcType)
            ? {
                action: 'posting_idea',
                id: pcId,
                type: pcType,
              }
            : undefined,
          action: () => redirectToIdeaForm(),
        });
      }
    };

    const verificationLink = (
      <a href="" role="button" onClick={verify}>
        {formatMessage(messages.verificationLinkText)}
      </a>
    );

    const signUpLink = (
      <a href="" role="button" onClick={signUp}>
        {formatMessage(messages.signUpLinkText)}
      </a>
    );

    const signInLink = (
      <a href="" role="button" onClick={signIn}>
        {formatMessage(messages.signInLinkText)}
      </a>
    );

    if (show) {
      const tippyContent =
        !enabled && !!disabledReason ? (
          <TooltipContent
            id="tooltip-content"
            className="e2e-disabled-tooltip"
            inMap={inMap}
          >
            <TooltipContentIcon name="lock-outlined" ariaHidden />
            <TooltipContentText>
              <FormattedMessage
                {...disabledMessages[disabledReason]}
                values={{ verificationLink, signUpLink, signInLink }}
              />
            </TooltipContentText>
          </TooltipContent>
        ) : null;

      if (inMap && !enabled && !!disabledReason) {
        return (
          <TooltipContent
            id="tooltip-content"
            className="e2e-disabled-tooltip"
            inMap={inMap}
          >
            <TooltipContentIcon name="lock-outlined" ariaHidden />
            <TooltipContentText>
              <FormattedMessage
                {...disabledMessages[disabledReason]}
                values={{ verificationLink, signUpLink, signInLink }}
              />
            </TooltipContentText>
          </TooltipContent>
        );
      }

      return (
        <Container className={className || ''}>
          <Tippy
            disabled={!tippyContent}
            interactive={true}
            placement="bottom"
            content={tippyContent || <></>}
            theme="light"
            hideOnClick={false}
          >
            <ButtonWrapper
              tabIndex={!enabled ? 0 : -1}
              className={`e2e-idea-button ${!enabled ? 'disabled' : ''} ${
                disabledReason ? disabledReason : ''
              }`}
            >
              <Button
                {...buttonContainerProps}
                aria-describedby="tooltip-content"
                onClick={onClick}
                disabled={!enabled}
                ariaDisabled={false}
              >
                <FormattedMessage {...messages.startAnIdea} />
              </Button>
            </ButtonWrapper>
          </Tippy>
        </Container>
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

const IdeaButtonWithHoC = injectIntl(IdeaButton);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaButtonWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
