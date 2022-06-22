import { useState, useEffect } from 'react';

// services
import {
  usersByRegFieldStream,
  usersByGenderStream,
  usersByDomicileStream,
  TStreamResponse,
} from 'modules/commercial/user_custom_fields/services/stats';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { sum, percentage, roundPercentages } from 'utils/math';

// typings
import {
  IUserCustomFieldData,
  TCustomFieldCode,
} from 'modules/commercial/user_custom_fields/services/userCustomFields';
import { Multiloc } from 'typings';

interface RepresentativenessRowBase {
  actualPercentage: number;
  referencePercentage: number;
  actualNumber: number;
  referenceNumber: number;
}
export interface RepresentativenessRow extends RepresentativenessRowBase {
  name: string;
}

export interface RepresentativenessRowMultiloc
  extends RepresentativenessRowBase {
  title_multiloc: Multiloc;
}

export type RepresentativenessData = RepresentativenessRow[];

const getSubscription = (
  code: TCustomFieldCode | null,
  userCustomFieldId: string,
  projectId: string | undefined,
  handleStreamResponse: (usersByField: TStreamResponse) => void
) => {
  if (code === 'gender') {
    const observable = usersByGenderStream({
      queryParameters: { project: projectId },
    }).observable;

    const subscription = observable.subscribe(handleStreamResponse);
    return subscription;
  }

  if (code === 'domicile') {
    const observable = usersByDomicileStream({
      queryParameters: { project: projectId },
    }).observable;

    const subscription = observable.subscribe(handleStreamResponse);
    return subscription;
  }

  const observable = usersByRegFieldStream(
    { queryParameters: { project: projectId } },
    userCustomFieldId
  ).observable;

  const subscription = observable.subscribe(handleStreamResponse);
  return subscription;
};

function useReferenceData(
  userCustomField: IUserCustomFieldData,
  projectId?: string
) {
  const [referenceData, setReferenceData] = useState<
    RepresentativenessRowMultiloc[] | NilOrError
  >();
  const [includedUserPercentage, setIncludedUserPercentage] = useState<
    number | NilOrError
  >();
  const [referenceDataUploaded, setReferenceDataUploaded] = useState<
    boolean | undefined
  >();

  const code = userCustomField.attributes.code;
  const userCustomFieldId = userCustomField.id;

  useEffect(() => {
    const handleStreamResponse = (usersByField: TStreamResponse) => {
      if (isNilOrError(usersByField)) {
        setReferenceData(usersByField);
        setIncludedUserPercentage(usersByField);
        return;
      }

      if (!usersByField.series.expected_users) {
        setReferenceDataUploaded(false);
        return;
      }

      const referenceData = toReferenceData(usersByField);
      const includedUsersPercentage = getIncludedUserPercentage(usersByField);
      setReferenceData(referenceData);
      setIncludedUserPercentage(includedUsersPercentage);
      setReferenceDataUploaded(true);
    };

    const subscription = getSubscription(
      code,
      userCustomFieldId,
      projectId,
      handleStreamResponse
    );

    if (subscription) {
      return () => subscription.unsubscribe();
    }

    return;
  }, [code, userCustomFieldId, projectId]);

  return {
    referenceData,
    includedUserPercentage,
    referenceDataUploaded,
  };
}

export default useReferenceData;

const toReferenceData = (
  usersByField: TStreamResponse
): RepresentativenessRowMultiloc[] => {
  const { users, expectedUsers } = includeOnlyExpectedUsers(usersByField);

  const options =
    'options' in usersByField ? usersByField.options : usersByField.areas;

  const actualPercentages = roundPercentages(Object.values(users), 1);
  const referencePercentages = roundPercentages(
    Object.values(expectedUsers),
    1
  );

  const data = Object.keys(users).map((optionId, i) => ({
    title_multiloc: options[optionId].title_multiloc,
    actualPercentage: actualPercentages[i],
    referencePercentage: referencePercentages[i],
    actualNumber: users[optionId],
    referenceNumber: expectedUsers[optionId],
  }));

  return data;
};

const includeOnlyExpectedUsers = ({ series }: TStreamResponse) => {
  const users = {};
  const expectedUsers = series.expected_users;

  for (const optionId in expectedUsers) {
    users[optionId] = series.users[optionId];
  }

  return { users, expectedUsers };
};

const getIncludedUserPercentage = (usersByField: TStreamResponse): number => {
  const { users, expected_users } = usersByField.series;

  const known = Object.keys(users)
    .filter((optionId) => optionId in expected_users)
    .reduce((acc, v) => users[v] + acc, 0);

  const total = sum(Object.values(users));
  return percentage(known, total);
};
