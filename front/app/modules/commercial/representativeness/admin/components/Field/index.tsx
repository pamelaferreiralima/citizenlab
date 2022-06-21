import React, { useState, useEffect } from 'react';
import { omit } from 'lodash-es';

// services
import {
  createReferenceDistribution,
  replaceReferenceDistribution,
  deleteReferenceDistribution,
} from '../../services/referenceDistribution';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useReferenceDistribution from '../../hooks/useReferenceDistribution';

// components
import { Accordion } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';
import FieldContent from './FieldContent';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import {
  getInitialValues,
  getSubmitAction,
  getStatus,
  parseFormValues,
} from './utils';

// typings
import { Multiloc } from 'typings';
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import { IReferenceDistributionData } from '../../services/referenceDistribution';

interface Props {
  userCustomFieldId: string;
  titleMultiloc: Multiloc;
  isDefault: boolean;
}

interface InnerProps extends Props {
  userCustomFieldOptions: IUserCustomFieldOptionData[];
  referenceDistribution: IReferenceDistributionData | NilOrError;
  referenceDataUploaded: boolean;
}

const Field = ({
  userCustomFieldId,
  titleMultiloc,
  isDefault,
  userCustomFieldOptions,
  referenceDistribution,
  referenceDataUploaded,
}: InnerProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [formValues, setFormValues] = useState(
    getInitialValues(
      userCustomFieldOptions,
      referenceDataUploaded,
      referenceDistribution
    )
  );

  useEffect(() => {
    if (formValues === null) {
      setFormValues(
        getInitialValues(
          userCustomFieldOptions,
          referenceDataUploaded,
          referenceDistribution
        )
      );
    }
  }, [
    formValues,
    userCustomFieldOptions,
    referenceDataUploaded,
    referenceDistribution,
  ]);

  if (formValues === null) return null;

  const onUpdateEnabled = (optionId: string, enabled: boolean) => {
    if (enabled) {
      setFormValues({
        ...formValues,
        [optionId]: null,
      });
    } else {
      setFormValues(omit(formValues, optionId));
    }
  };

  const onUpdatePopulation = (optionId: string, population: number | null) => {
    setFormValues({
      ...formValues,
      [optionId]: population,
    });
  };

  const onSubmit = async () => {
    setTouched(false);

    const submitAction = getSubmitAction(formValues, referenceDistribution);
    if (submitAction === null) return;

    const newDistribution = parseFormValues(formValues);
    if (newDistribution === null) return;

    setSubmitting(true);

    if (submitAction === 'create') {
      await createReferenceDistribution(userCustomFieldId, newDistribution);
    }

    if (submitAction === 'replace') {
      await replaceReferenceDistribution(userCustomFieldId, newDistribution);
    }

    if (submitAction === 'delete') {
      await deleteReferenceDistribution(userCustomFieldId);
    }

    setSubmitting(false);
  };

  const status = getStatus(formValues, referenceDistribution, touched);

  return (
    <Accordion
      title={
        <FieldTitle
          titleMultiloc={titleMultiloc}
          isDefault={isDefault}
          status={status}
        />
      }
    >
      <FieldContent
        userCustomFieldId={userCustomFieldId}
        formValues={formValues}
        submitting={submitting}
        touched={touched}
        onUpdateEnabled={onUpdateEnabled}
        onUpdatePopulation={onUpdatePopulation}
        onSubmit={onSubmit}
      />
    </Accordion>
  );
};

const FieldWrapper = ({
  userCustomFieldId,
  titleMultiloc,
  isDefault,
}: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
  const { referenceDistribution, referenceDataUploaded } =
    useReferenceDistribution(userCustomFieldId);

  if (
    isNilOrError(userCustomFieldOptions) ||
    referenceDataUploaded === undefined
  ) {
    return null;
  }

  return (
    <Field
      userCustomFieldId={userCustomFieldId}
      titleMultiloc={titleMultiloc}
      isDefault={isDefault}
      userCustomFieldOptions={userCustomFieldOptions}
      referenceDistribution={referenceDistribution}
      referenceDataUploaded={referenceDataUploaded}
    />
  );
};

export default FieldWrapper;
