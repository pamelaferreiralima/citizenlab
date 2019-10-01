import React, { memo, useCallback, useState, useEffect } from 'react';
import { isNilOrError, transformLocale } from 'utils/helperUtils';
import * as clipboard from 'clipboard-polyfill';

// hooks
import useLocale from 'hooks/useLocale';

// graphql
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  max-width: 1050px;
  padding: 65px;
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px #e0e0e0;

  ${media.smallerThanMinTablet`
    padding: 30px;
  `}
`;

const SpinnerWrapper = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 60px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
  `}
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;

  ${media.biggerThanMinTablet`
    margin-left: 30px;
  `}
`;

const Title = styled.h1`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xxl}px;
  font-weight: 600;
  line-height: normal;
  padding: 0;
  margin: 0;
  margin-bottom: 10px;

  ${media.smallerThanMinTablet`
    margin-bottom: 5px;
  `}
`;

const Subtitle = styled.h2`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  padding: 0;
  margin-top: 0;
  margin-bottom: 5px;

  ${media.smallerThanMinTablet`
    padding-bottom: 35px;
  `}
`;

const LinkCopied = styled.div`
  color: ${colors.clGreenSuccess};
  display: flex;
  align-items: center;
  opacity: 0;
  transition: all 150ms ease-out;

  &.visible {
    opacity: 1;
  }

  ${media.smallerThanMinTablet`
    order: 2;
  `}
`;

const LinkCopiedIcon = styled(Icon)`
  fill: ${colors.clGreenSuccess};
  height: 13px;
  margin-right: 3px;
`;

const CopyLinkButton = styled(Button)`
  margin-left: 20px;

  ${media.smallerThanMinTablet`
    order: 1;
    margin-left: 0px;
    margin-right: 20px;
  `}
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const MetaInfoLeft = styled.div`
  display: flex;
  align-items: center;
`;

const MetaInfoRight = styled.div`
  display: flex;
  align-items: center;
  margin-left: 30px;
`;

const Department = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px ${colors.separation};
  margin-right: 5px;
`;

const Purpose = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  margin-right: 30px;
`;

const PurposeIcon = styled(Icon)`
  fill: ${colors.label};
  height: 24px;
  margin-right: 7px;
`;

const ParticipationLevel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
`;

const ParticipationLevelIcon = styled(Icon)`
  fill: ${colors.label};
  height: 24px;
  margin-right: 7px;
`;

const Content = styled.div`
  margin-bottom: 40px;
`;

const Phases = styled.div`
  width: 100%;
  /* padding-left: 30px; */
  /* padding-right: 30px; */
  padding-top: 60px;
  padding-bottom: 60px;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const PhaseBar: any = styled.button`
  width: 100%;
  height: 24px;
  color: #fff;
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  transition: background 60ms ease-out;
  position: relative;
  cursor: pointer;
  border: none;
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const PhaseArrow = styled(Icon)`
  width: 20px;
  height: 25px;
  fill: #fff;
  position: absolute;
  top: 0px;
  right: -9px;
  z-index: 2;

  ${media.smallerThanMaxTablet`
    fill: ${colors.background};
  `}
`;

const PhaseText: any = styled.div`
  color: #e0e0e0;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 20px;
  max-height: 60px;
  margin-top: 12px;
  padding-left: 6px;
  padding-right: 6px;
  transition: color 60ms ease-out;
`;

const PhaseContainer: any = styled.div`
  min-width: 80px;
  flex-shrink: 1;
  flex-grow: ${(props: any) => props.numberOfDays};
  flex-basis: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  margin-right:  ${(props: any) => !props.last ? '1px' : '0px' };

  &.first ${PhaseBar} {
    border-radius: ${(props: any) => props.theme.borderRadius} 0px 0px ${(props: any) => props.theme.borderRadius};
  }

  &.last ${PhaseBar} {
    border-radius: 0px ${(props: any) => props.theme.borderRadius} ${(props: any) => props.theme.borderRadius} 0px;
  }
`;

const HeaderImage = styled.div<{ src: string }>`
  width: 100%;
  height: 260px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${({ src }) => src});
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  margin-bottom: 20px;
`;

const Footer = styled.div``;

const SuccessCasesTitle = styled.div`
  width: 100%;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: normal;
  margin-bottom: 20px;
`;

const SuccessCases = styled.div``;

const SuccessCase = styled.a`
  padding: 12px 20px;
  margin-right: 8px;
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px ${colors.separation};
  transition: all 80ms ease-out;

  &:hover {
    border-color: #999;
  }
`;

const SuccessCaseImage = styled.img`
  height: 26px;
`;

export interface Props {
  projectTemplateId: string;
  className?: string;
}

const ProjectTemplatePreview = memo<Props>(({ projectTemplateId, className }) => {

  const locale = useLocale();

  const [linkCopied, setLinkCopied] = useState(false);

  const graphQLLocale = !isNilOrError(locale) ? transformLocale(locale) : null;

  const TEMPLATE_QUERY = gql`
    {
      projectTemplate(id: "${projectTemplateId}"){
        id
        headerImage
        departments {
          id
          titleMultiloc {
            ${graphQLLocale}
          }
        }
        participationLevels {
          id
          titleMultiloc {
            ${graphQLLocale}
          }
        }
        purposes {
          id
          titleMultiloc {
            ${graphQLLocale}
          }
        }
        titleMultiloc {
          ${graphQLLocale}
        }
        subtitleMultiloc {
          ${graphQLLocale}
        }
        descriptionMultilocs {
          content
          locale
        }
        successCases {
          id
          href
          image
        }
      }
    }
  `;

  const { loading, data } = useQuery(TEMPLATE_QUERY);

  const copyLink = useCallback(() => {
    clipboard.writeText(`${window.location.origin}/templates/${projectTemplateId}`);
    setLinkCopied(true);
  }, []);

  useEffect(() => {
    if (linkCopied) {
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, [linkCopied]);

  return (
    <Container className={className}>
      {loading &&
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      }

      {!loading && data &&
        <>
        <Header>
          <HeaderLeft>
            <Title>{data.projectTemplate.titleMultiloc[`${graphQLLocale}`]}</Title>
            <Subtitle>{data.projectTemplate.subtitleMultiloc[`${graphQLLocale}`]}</Subtitle>
          </HeaderLeft>

          <HeaderRight>
            <LinkCopied className={linkCopied ? 'visible' : 'hidden'}>
              <LinkCopiedIcon name="checkmark" />
              <FormattedMessage {...messages.copied} />
            </LinkCopied>
            <CopyLinkButton
              onClick={copyLink}
              icon="link"
              style="secondary"
            >
              <FormattedMessage {...messages.copyLink} />
            </CopyLinkButton>
          </HeaderRight>
        </Header>

        <MetaInfo>
          <MetaInfoLeft>
            {data.projectTemplate.departments && data.projectTemplate.departments.map((department) => (
              <Department key={department.id}>
                {department.titleMultiloc[`${graphQLLocale}`]}
              </Department>
            ))}
          </MetaInfoLeft>
          <MetaInfoRight>
            {data.projectTemplate.purposes && data.projectTemplate.purposes.length > 0 &&
              <Purpose>
                <PurposeIcon name="purpose" />
                {data.projectTemplate.purposes.map((purpose) => purpose.titleMultiloc[`${graphQLLocale}`]).join(', ')}
              </Purpose>
            }
            {data.projectTemplate.participationLevels && data.projectTemplate.participationLevels.length > 0 &&
              <ParticipationLevel>
                <ParticipationLevelIcon name="participationLevel" />
                {data.projectTemplate.participationLevels.map((participationLevel) => participationLevel.titleMultiloc[`${graphQLLocale}`]).join(', ')}
              </ParticipationLevel>
            }
          </MetaInfoRight>
        </MetaInfo>

        <Content>
          {data.projectTemplate.headerImage &&
            <HeaderImage src={data.projectTemplate.headerImage} />
          }

          <QuillEditedContent textColor={colors.adminTextColor}>
            <div dangerouslySetInnerHTML={{ __html: data.projectTemplate.descriptionMultilocs[0].content }} />
          </QuillEditedContent>
        </Content>

        <Phases>
          <PhaseContainer
            className="first"
            numberOfDays="10"
          >
            <PhaseBar>
              1
              <PhaseArrow name="phase_arrow" />
            </PhaseBar>
            <PhaseText>
              Phase 1
            </PhaseText>
          </PhaseContainer>
          <PhaseContainer
            numberOfDays="10"
          >
            <PhaseBar>
              2
              <PhaseArrow name="phase_arrow" />
            </PhaseBar>
            <PhaseText>
              Phase 2
            </PhaseText>
          </PhaseContainer>
          <PhaseContainer
            className="last"
            numberOfDays="10"
          >
            <PhaseBar>
              3
              <PhaseArrow name="phase_arrow" />
            </PhaseBar>
            <PhaseText>
              Phase 3
            </PhaseText>
          </PhaseContainer>
        </Phases>

        {data.projectTemplate.successCases && data.projectTemplate.successCases.length > 0 &&
          <Footer>
            <SuccessCasesTitle>
              <FormattedMessage {...messages.alsoUsedIn} />
            </SuccessCasesTitle>
            <SuccessCases>
              { data.projectTemplate.successCases.map((successCase) => (
                <SuccessCase key={successCase.id} href={successCase.href} target="_blank">
                  <SuccessCaseImage src={successCase.image} />
                </SuccessCase>
              ))}
            </SuccessCases>
          </Footer>
        }
        </>
      }
    </Container>
  );

});

export default ProjectTemplatePreview;
