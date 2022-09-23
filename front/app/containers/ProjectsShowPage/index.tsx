import React, { memo, useEffect, useMemo, useState } from 'react';
import { isError } from 'lodash-es';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import clHistory from 'utils/cl-router/history';

// components
import ProjectHelmet from './shared/header/ProjectHelmet';
import ProjectNotFound from './shared/header/ProjectNotFound';
import ProjectNotVisible from './shared/header/ProjectNotVisible';
import ProjectHeader from './shared/header/ProjectHeader';
import ProjectEvents from './shared/events';
import ContinuousIdeas from './continuous/Ideas';
import ContinuousSurvey from './continuous/Survey';
import ContinuousPoll from './continuous/Poll';
import ContinuousVolunteering from './continuous/Volunteering';
import TimelineContainer from './timeline';
import { Box, Spinner, Title, Image } from '@citizenlab/cl2-component-library';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import Modal from 'components/UI/Modal';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'hooks/useEvents';
import useAuthUser from 'hooks/useAuthUser';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import rocket from './rocket.png';

// typings
import { IProjectData } from 'services/projects';

// other
import { isValidPhase } from './phaseParam';
import { anyIsUndefined, isNilOrError, isApiError } from 'utils/helperUtils';
import { getLatestRelevantPhase } from 'services/phases';
import { getMethodConfig } from 'utils/participationMethodUtils';

const Container = styled.main<{ background: string }>`
  flex: 1 0 auto;
  height: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${(props) => props.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${({ theme: { mobileMenuHeight } }) =>
      mobileMenuHeight}px - ${({ theme: { mobileTopBarHeight } }) =>
    mobileTopBarHeight}px);
  `}

  ${media.smallerThanMinTablet`
    min-height: calc(100vh - ${({ theme: { mobileMenuHeight } }) =>
      mobileMenuHeight}px - ${({ theme: { mobileTopBarHeight } }) =>
    mobileTopBarHeight}px);
  `}
`;

const Loading = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
`;

interface Props {
  project: IProjectData | Error | null | undefined;
  scrollToEventId?: string;
}

const ProjectsShowPage = memo<Props>(({ project, scrollToEventId }) => {
  const projectId = !isNilOrError(project) ? project.id : undefined;
  const projectNotFound = isError(project);
  const processType = !isNilOrError(project)
    ? project.attributes.process_type
    : undefined;

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const showModal = queryParams.get('show_modal');
    if (!isNilOrError(showModal)) {
      setTimeout(() => {
        setShowModal(JSON.parse(showModal));
      }, 1000);
      clHistory.replace(window.location.pathname);
    }
  }, []);

  const [showModal, setShowModal] = useState(false);
  const locale = useLocale();
  const tenant = useAppConfiguration();
  const phases = usePhases(projectId);
  const { events } = useEvents({
    projectIds: projectId ? [projectId] : undefined,
    sort: 'newest',
  });
  const user = useAuthUser();

  const loading = useMemo(() => {
    return anyIsUndefined(locale, tenant, project, phases, events);
  }, [locale, tenant, project, phases, events]);

  const isUnauthorized = useMemo(() => {
    if (!isApiError(project)) return false;

    return project.json.errors?.base[0].error === 'Unauthorized!';
  }, [project]);

  const userSignedInButUnauthorized = !isNilOrError(user) && isUnauthorized;
  const userNotSignedInAndUnauthorized = isNilOrError(user) && isUnauthorized;

  let content: JSX.Element | null = null;

  if (userNotSignedInAndUnauthorized) return <ForbiddenRoute />;

  if (userSignedInButUnauthorized) {
    content = <ProjectNotVisible />;
  } else if (loading) {
    content = (
      <Loading>
        <Spinner />
      </Loading>
    );
  } else if (projectNotFound) {
    content = <ProjectNotFound />;
  } else if (projectId && processType) {
    let phaseParticipationMethod;

    if (!isNilOrError(phases)) {
      phaseParticipationMethod =
        getLatestRelevantPhase(phases)?.attributes.participation_method;
    }
    const config = getMethodConfig(
      phaseParticipationMethod
        ? phaseParticipationMethod
        : project?.attributes.participation_method
    );

    content = (
      <ContentWrapper id="e2e-project-page">
        <ProjectHeader projectId={projectId} />
        {processType === 'continuous' ? (
          <>
            <ContinuousIdeas projectId={projectId} />
            <ContinuousSurvey projectId={projectId} />
            <ContinuousPoll projectId={projectId} />
            <ContinuousVolunteering projectId={projectId} />
          </>
        ) : (
          <TimelineContainer projectId={projectId} />
        )}
        <ProjectEvents
          projectId={projectId}
          scrollToEventId={scrollToEventId}
        />
        <Modal
          opened={showModal}
          close={() => {
            setShowModal(false);
          }}
          hasSkipButton={false}
        >
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Image width="80px" height="80px" src={rocket} alt="" />
            <Title variant="h2" textAlign="center">
              {config.getSubmissionMessage()}
            </Title>
          </Box>
        </Modal>
      </ContentWrapper>
    );
  }

  const bgColor =
    !isNilOrError(events) && events.length > 0 ? '#fff' : colors.background;

  return (
    <Container background={bgColor}>
      {!isNilOrError(project) && <ProjectHelmet project={project} />}
      {content}
    </Container>
  );
});

const ProjectsShowPageWrapper = memo<WithRouterProps>(
  ({ location: { pathname, query }, params: { slug, phaseNumber } }) => {
    const project = useProject({ projectSlug: slug });
    const phases = usePhases(project?.id);
    const { scrollToEventId } = query;
    const processType = project?.attributes?.process_type;

    const urlSegments = pathname
      .replace(/^\/|\/$/g, '')
      .split('/')
      .filter((segment) => segment !== '');

    // If processType is 'timeline' but the phases aren't loaded yet: don't render yet
    if (processType === 'timeline' && isNilOrError(phases)) return null;

    if (
      processType === 'timeline' &&
      urlSegments.length === 4 &&
      !isNilOrError(phases) &&
      isValidPhase(phaseNumber, phases)
    ) {
      // If this is a timeline project and a valid phase param was passed: continue
      return <ProjectsShowPage project={project} />;
    } else if (scrollToEventId) {
      // If an event id was passed as a query param, pass it on
      return (
        <ProjectsShowPage project={project} scrollToEventId={scrollToEventId} />
      );
    } else if (urlSegments.length > 3 && urlSegments[1] === 'projects') {
      // Redirect old childRoutes (e.g. /info, /process, ...) to the project index location
      clHistory.replace(`/${urlSegments.slice(1, 3).join('/')}`);
    } else if (slug) {
      return <ProjectsShowPage project={project} />;
    }

    return null;
  }
);

const ProjectsShowPageWrapperWithHoC = withRouter(ProjectsShowPageWrapper);

export default ProjectsShowPageWrapperWithHoC;
