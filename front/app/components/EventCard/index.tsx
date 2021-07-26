import React, { memo } from 'react';
import moment from 'moment';

// components
import DateBlocks from './DateBlocks';
import EventInformation from './EventInformation';

// services
import { IEventData } from 'services/events';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';

// style
import styled from 'styled-components';
import { defaultCardStyle, defaultCardHoverStyle } from 'utils/styleUtils';

// other
import { getIsoDate } from 'utils/dateUtils';
import { isNilOrError, isNil } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

const Container = styled.div<{ clickable?: boolean }>`
  ${defaultCardStyle};
  ${({ clickable }) => (clickable ? defaultCardHoverStyle : '')}
  ${({ clickable }) => (clickable ? 'cursor: pointer;' : '')}
  width: 100%;
  padding: 30px;
  display: flex;
  box-shadow: none;
  border: solid 1px #ccc;
`;

interface Props {
  event: IEventData;
  className?: string;
  id?: string;
  onClickGoToProjectAndScrollToEvent?: boolean;
  showProjectTitle?: boolean;
  showLocation?: boolean;
  showDescription?: boolean;
  showAttachments?: boolean;
  titleFontSize?: number;
}

const EventCard = memo<Props>((props) => {
  const {
    event,
    className,
    id,
    onClickGoToProjectAndScrollToEvent,
    ...otherProps
  } = props;

  const projectId = event.relationships.project.data.id;

  const locale = useLocale();
  const project = useProject({ projectId });

  const onClick = () => {
    if (
      !onClickGoToProjectAndScrollToEvent ||
      isNilOrError(locale) ||
      isNil(project)
    ) {
      return;
    }
    const slug = project.attributes.slug;
    const scrollTo = `?scrollTo=${event.id}`;

    clHistory.push(`/${locale}/projects/${slug}/${scrollTo}`);
  };

  if (!isNilOrError(event)) {
    const startAtMoment = moment(event.attributes.start_at);
    const endAtMoment = moment(event.attributes.end_at);
    const startAtIsoDate = getIsoDate(event.attributes.start_at);
    const endAtIsoDate = getIsoDate(event.attributes.end_at);
    const isMultiDayEvent = startAtIsoDate !== endAtIsoDate;

    return (
      <Container
        className={className || ''}
        id={id || ''}
        clickable={onClickGoToProjectAndScrollToEvent}
        onClick={onClick}
      >
        <DateBlocks
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          isMultiDayEvent={isMultiDayEvent}
        />

        <EventInformation
          event={event}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          isMultiDayEvent={isMultiDayEvent}
          {...otherProps}
        />
      </Container>
    );
  }

  return null;
});

export default EventCard;
