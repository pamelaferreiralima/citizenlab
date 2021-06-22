import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import { IEventData, IEvents, eventsStream } from 'services/events';

export default function useProject(projectId?: string | null) {
  const [events, setEvents] = useState<IEventData[] | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    setEvents(undefined);

    let observable: Observable<IEvents | null> = of(null);

    if (projectId) {
      observable = eventsStream({ queryParameters: { project_id: projectId } })
        .observable;
    } else {
      observable = eventsStream().observable;
    }

    const subscription = observable.subscribe((response) => {
      const events = !isNilOrError(response) ? response.data : response;
      setEvents(events);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return events;
}
