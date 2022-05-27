import { API_PATH } from 'containers/App/constants';
import { Multiloc } from 'typings';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/stats`;

export interface IUsersByGender {
  series: {
    users: {
      [key: string]: number;
    };
  };
  // Just making assumptions about what the response will look like here
  referenceSeries?: {
    users: {
      [key: string]: number;
    };
  };
  referenceDataUploaded?: string;
}

export interface IUsersByRegistrationField {
  series: {
    users: {
      [key: string]: number;
    };
  };
  options: {
    [key: string]: {
      title_multiloc: Multiloc;
      ordering: number;
    };
  };
  // Just making assumptions about what the response will look like here
  referenceSeries?: {
    users: {
      [key: string]: number;
    };
  };
  referenceDataUploaded?: string;
}

export interface IUsersByDomicile {
  series: {
    users: {
      [key: string]: number;
    };
  };
  areas: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
  // Just making assumptions about what the response will look like here
  referenceSeries?: {
    users: {
      [key: string]: number;
    };
  };
  referenceDataUploaded?: string;
}

// Ignoring this one for this iteration
export interface IUsersByBirthyear {
  series: {
    users: {
      [key: string]: number;
    };
  };
}

export type TStreamResponse =
  | IUsersByRegistrationField
  | IUsersByGender
  | IUsersByDomicile;

export const usersByRegFieldXlsxEndpoint = (customFieldId: string) =>
  `${apiEndpoint}/users_by_custom_field_as_xlsx/${customFieldId}`;

export function usersByRegFieldStream(
  streamParams: IStreamParams | null = null,
  customFieldId: string
) {
  return streams.get<IUsersByRegistrationField>({
    apiEndpoint: `${apiEndpoint}/users_by_custom_field/${customFieldId}`,
    ...streamParams,
    cacheStream: false,
  });
}

export const usersByBirthyearXlsxEndpoint = `${apiEndpoint}/users_by_birthyear_as_xlsx`;

export function usersByBirthyearStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUsersByBirthyear>({
    apiEndpoint: `${apiEndpoint}/users_by_birthyear`,
    ...streamParams,
  });
}

export const usersByGenderXlsxEndpoint = `${apiEndpoint}/users_by_gender_as_xlsx`;

export function usersByGenderStream(streamParams: IStreamParams | null = null) {
  return streams.get<IUsersByGender>({
    apiEndpoint: `${apiEndpoint}/users_by_gender`,
    ...streamParams,
  });
}

export const usersByDomicileXlsxEndpoint = `${apiEndpoint}/users_by_domicile_as_xlsx`;

export function usersByDomicileStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUsersByDomicile>({
    apiEndpoint: `${apiEndpoint}/users_by_domicile`,
    ...streamParams,
  });
}
