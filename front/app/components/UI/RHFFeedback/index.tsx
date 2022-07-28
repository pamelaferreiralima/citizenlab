import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Error, { findErrorMessage, TFieldName } from 'components/UI/Error';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import {
  Text,
  Title,
  Box,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import { scrollToElement } from 'utils/scroll';
import CloseIconButton from '../CloseIconButton';

const RHFFeedback = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const [successMessageIsVisible, setSuccessMessageIsVisible] = useState(true);
  const {
    formState: { errors, isSubmitSuccessful, isSubmitted, submitCount },
  } = useFormContext();

  useEffect(() => {
    if (submitCount > 0) {
      scrollToElement({ id: 'rhfFeedback' });
      setSuccessMessageIsVisible(true);
    }
  }, [submitCount]);

  const getAllErrorMessages = () => {
    const errorMessages: Array<{ field: string; message?: string }> = [];

    for (const field in errors) {
      const standardFieldError = errors[field]?.message;
      const apiError = errors[field]?.error;
      const multilocFieldFirstError = Object.values(
        errors[field] as Record<string, any>
      )[0]?.message;

      if (standardFieldError) {
        errorMessages.push({
          field,
          message: String(standardFieldError),
        });
      } else if (apiError) {
        const apiErrorMessage = findErrorMessage(
          field as TFieldName,
          String(apiError)
        );
        if (apiErrorMessage) {
          errorMessages.push({
            field,
            message: formatMessage(apiErrorMessage),
          });
        }
      } else if (multilocFieldFirstError) {
        errorMessages.push({
          field,
          message: multilocFieldFirstError,
        });
      }
    }

    return errorMessages;
  };

  // Add tests
  // Add copy
  const closeSuccessMessage = () => setSuccessMessageIsVisible(false);
  const successMessageIsShown = isSubmitSuccessful && successMessageIsVisible;
  const errorMessageIsShown =
    getAllErrorMessages().length > 0 && !isSubmitSuccessful;

  return (
    <>
      {isSubmitted && (
        <Box id="rhfFeedback">
          {successMessageIsShown && (
            <Box
              bgColor={colors.clGreenSuccessBackground}
              borderRadius="3px"
              px="12px"
              py="4px"
              mb="12px"
              role="alert"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" gap="16px" alignItems="center">
                <Icon
                  name="checkmark-full"
                  fill={colors.clGreenSuccess}
                  width="24px"
                  height="24px"
                />
                <Title color="clGreenSuccess" variant="h4" as="h3">
                  Form is submitted successfully
                </Title>
              </Box>
              <CloseIconButton onClick={closeSuccessMessage} />
            </Box>
          )}
          {errorMessageIsShown && (
            <Error marginBottom="12px">
              <Title color="clRed" variant="h4">
                There is a problem
              </Title>
              {getAllErrorMessages().map((error) => {
                return (
                  <Text
                    key={error.field}
                    onClick={() => scrollToElement({ id: error.field })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        scrollToElement({ id: error.field });
                      }
                    }}
                    textDecoration="underline"
                    color="clRed"
                    style={{ cursor: 'pointer' }}
                    role="link"
                    tabIndex={0}
                  >
                    {error.message}
                  </Text>
                );
              })}
            </Error>
          )}
        </Box>
      )}
    </>
  );
};

export default injectIntl(RHFFeedback);
