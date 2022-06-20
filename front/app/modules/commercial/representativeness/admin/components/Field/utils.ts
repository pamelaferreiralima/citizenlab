// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import {
  IReferenceDistributionData,
  TUploadDistribution,
} from '../../services/referenceDistribution';

interface OptionValues {
  enabled: boolean;
  population?: number;
}

export type FormValues = Record<string, OptionValues>;

export const getInitialValues = (
  userCustomFieldOptions: IUserCustomFieldOptionData[],
  referenceDataUploaded: boolean,
  referenceDistribution: IReferenceDistributionData | NilOrError
): FormValues | null => {
  if (referenceDataUploaded) {
    if (isNilOrError(referenceDistribution)) return null;

    return getInitialValuesFromDistribution(
      userCustomFieldOptions,
      referenceDistribution
    );
  }

  return getEmptyInitialValues(userCustomFieldOptions);
};

const getInitialValuesFromDistribution = (
  userCustomFieldOptions: IUserCustomFieldOptionData[],
  referenceDistribution: IReferenceDistributionData
): FormValues => {
  const { distribution } = referenceDistribution.attributes;

  return userCustomFieldOptions.reduce((acc, { id }) => {
    const referenceDistributionValue = distribution[id];

    return {
      ...acc,
      [id]: referenceDistributionValue
        ? { enabled: true, population: referenceDistributionValue.count }
        : { enabled: false, population: undefined },
    };
  }, {});
};

const getEmptyInitialValues = (
  userCustomFieldOptions: IUserCustomFieldOptionData[]
): FormValues => {
  return userCustomFieldOptions.reduce(
    (acc, { id }) => ({
      ...acc,
      [id]: { enabled: true, population: undefined },
    }),
    {}
  );
};

export const isFormValid = (formValues: FormValues) => {
  if (isFormEmpty(formValues)) {
    return true;
  }

  const anyOptionInvalid = Object.keys(formValues).some((optionId) => {
    const { enabled, population } = formValues[optionId];
    return enabled && population === undefined;
  });

  const allOptionsValid = !anyOptionInvalid;

  const numberOfOptionsFilledOut = Object.keys(formValues)
    .map((optionId) => formValues[optionId])
    .filter(
      ({ population, enabled }) => enabled && population !== undefined
    ).length;

  return allOptionsValid && numberOfOptionsFilledOut > 1;
};

export const getSubmitAction = (
  formValues: FormValues,
  referenceDistribution: IReferenceDistributionData | NilOrError
) => {
  if (isNilOrError(referenceDistribution)) {
    return 'create';
  }

  if (noChanges(formValues, referenceDistribution)) {
    return null;
  }

  if (isFormEmpty(formValues)) {
    return 'delete';
  }

  return 'replace';
};

const noChanges = (
  formValues: FormValues,
  referenceDistribution: IReferenceDistributionData
) => {
  const { distribution } = referenceDistribution.attributes;

  const anyChanges = Object.keys(formValues).some((optionId) => {
    const { population } = formValues[optionId];
    const savedPopulation = distribution[optionId]?.count;

    return savedPopulation !== population;
  });

  return !anyChanges;
};

const isFormEmpty = (formValues: FormValues) => {
  const anyNotEmpty = Object.keys(formValues).some((optionId) => {
    return formValues[optionId].population !== undefined;
  });

  return !anyNotEmpty;
};

export const parseFormValues = (
  formValues: FormValues
): TUploadDistribution => {
  return Object.keys(formValues).reduce((acc, optionId) => {
    const { population } = formValues[optionId];
    if (population === undefined) return acc;

    return {
      ...acc,
      [optionId]: population,
    };
  }, {});
};

export type Status = 'saved' | 'complete' | 'incomplete';

export const getStatus = (
  formValues: FormValues,
  referenceDistribution: IReferenceDistributionData | NilOrError,
  touched: boolean
): Status | null => {
  if (isSaved(formValues, referenceDistribution, touched)) {
    return 'saved';
  }

  if (isComplete(formValues, touched)) {
    return 'complete';
  }

  if (isIncomplete(formValues, touched)) {
    return 'incomplete';
  }

  return null;
};

const isSaved = (
  formValues: FormValues,
  referenceDistribution: IReferenceDistributionData | NilOrError,
  touched: boolean
) => {
  if (touched) return false;

  if (isNilOrError(referenceDistribution)) {
    return false;
  }

  return noChanges(formValues, referenceDistribution);
};

const isComplete = (formValues: FormValues, touched: boolean) => {
  return touched && !isFormEmpty(formValues) && isFormValid(formValues);
};

const isIncomplete = (formValues: FormValues, touched: boolean) => {
  return touched && !isFormEmpty(formValues) && !isFormValid(formValues);
};
