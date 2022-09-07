import React, { useState, useMemo, useEffect, ReactElement } from 'react';
import styled, { useTheme } from 'styled-components';

// components
import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';

import SectionFormWrapper from '../../components/SectionFormWrapper';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';

import {
  Box,
  ColorPickerInput,
  IconTooltip,
  IOption,
  Label,
  Select,
} from '@citizenlab/cl2-component-library';

import HeaderImageDropzone from './HeaderImageDropzone';
import RangeInput from 'components/UI/RangeInput';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Outlet from 'components/Outlet';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { UploadFile, Multiloc } from 'typings';
type MultilocErrorType = {
  signedOutHeaderErrors: Multiloc;
  signedOutSubheaderErrors: Multiloc;
};
export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import { HomepageHeroBannerInputSettings } from 'containers/Admin/pagesAndMenu/EditHomepage/HeroBanner';
import { CustomPageHeroBannerInputSettings } from 'containers/Admin/pagesAndMenu/containers/CustomPages/Edit/HeroBanner';

// utils
import { isNil, isNilOrError } from 'utils/helperUtils';
import { forOwn, size, trim, debounce } from 'lodash-es';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// constants
import Warning from 'components/UI/Warning';
const TITLE_MAX_CHAR_COUNT = 45;
const SUBTITLE_MAX_CHAR_COUNT = 90;

const BgHeaderPreviewSelect = styled(Select)`
  margin-bottom: 20px;
`;

// names differ slightly between HomePage and CustomPage
interface Props {
  breadcrumbs: TBreadcrumbs;
  title?: string | JSX.Element;
  formStatus: ISubmitState;
  setFormStatus: (submitState: ISubmitState) => void;
  onSave: (inputSettingParameters: HeroBannerInputSettings) => void;
  isLoading: boolean;
  inputSettings: HeroBannerInputSettings;
  avatarsFieldComponent?: ReactElement;
  outletSectionEnd?: ReactElement;
  bannerMultilocFieldComponent?: ReactElement;
}

export type HeroBannerInputSettings =
  | HomepageHeroBannerInputSettings
  | CustomPageHeroBannerInputSettings;

const GenericHeroBannerForm = ({
  onSave,
  inputSettings,
  setFormStatus,
  formStatus,
  isLoading,
  title,
  breadcrumbs,
  intl: { formatMessage },
  avatarsFieldComponent,
  outletSectionEnd,
  bannerMultilocFieldComponent,
}: Props & InjectedIntlProps) => {
  const theme: any = useTheme();

  // component state
  const [headerLocalDisplayImage, setHeaderLocalDisplayImage] = useState<
    UploadFile[] | null
  >(null);
  const [headerAndSubheaderErrors, setHeaderAndSubheaderErrors] =
    useState<MultilocErrorType>({
      signedOutHeaderErrors: {},
      signedOutSubheaderErrors: {},
    });
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [localSettings, setLocalSettings] =
    useState<HeroBannerInputSettings | null>(null);

  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  useEffect(() => {
    // copy input settings to local state
    setLocalSettings({
      ...inputSettings,
    });

    // the image file sent from the API needs to be converted
    // to a format that can be displayed. this is done locally
    // when the image is changed but needs to be done manually
    // to process the initial API response
    const convertHeaderToUploadFile = async (fileInfo) => {
      if (fileInfo) {
        const tenantHeaderBg = await convertUrlToUploadFile(fileInfo);
        const headerBgUploadFile = !isNilOrError(tenantHeaderBg)
          ? [tenantHeaderBg]
          : [];
        setHeaderLocalDisplayImage(headerBgUploadFile);
        setBannerError(null);
      }
    };

    const headerFileInfo = inputSettings.header_bg?.large;
    convertHeaderToUploadFile(headerFileInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSettings.header_bg]);

  const updateValueInLocalState = (
    key: keyof HeroBannerInputSettings,
    value: any
  ) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        [key]: value,
      });
    }

    setFormStatus('enabled');
  };

  const bannerImageAddHandler = (newImage: UploadFile[]) => {
    // this base64 value is sent to the API
    updateValueInLocalState('header_bg', newImage[0].base64);
    // this value is used for local display
    setHeaderLocalDisplayImage([newImage[0]]);
  };

  const bannerImageRemoveHandler = () => {
    updateValueInLocalState('header_bg', null);
    setHeaderLocalDisplayImage(null);
  };

  const handleOverlayColorOnChange = (color: string) => {
    updateValueInLocalState('banner_overlay_color', color);
  };

  const handleOverlayOpacityOnChange = (opacity: number) => {
    updateValueInLocalState('banner_overlay_opacity', opacity);
  };

  const debounceHandleOverlayOpacityOnChange = debounce(
    handleOverlayOpacityOnChange,
    15
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

  const handleHeaderOnChange = (titleMultiloc: Multiloc) => {
    const signedOutHeaderErrors = {};

    forOwn(titleMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        signedOutHeaderErrors[locale] = formatMessage(
          messages.titleMaxCharError
        );
      }
    });

    updateValueInLocalState('banner_header_multiloc', titleMultiloc);
    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutHeaderErrors,
    }));
  };

  const handleSubheaderOnChange = (subtitleMultiloc: Multiloc) => {
    const signedOutSubheaderErrors = {};

    forOwn(subtitleMultiloc, (subtitle, locale) => {
      if (size(trim(subtitle)) > 90) {
        signedOutSubheaderErrors[locale] = formatMessage(
          messages.subtitleMaxCharError
        );
      }
    });

    updateValueInLocalState('banner_subheader_multiloc', subtitleMultiloc);
    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutSubheaderErrors,
    }));
  };

  // set error and disable save button if header is removed,
  // the form cannot be saved without an image
  useEffect(() => {
    if (isNil(localSettings?.header_bg)) {
      setBannerError(formatMessage(messages.noHeader));
      setFormStatus('disabled');
      return;
    }

    setBannerError(null);
  }, [localSettings?.header_bg, formatMessage, setFormStatus]);

  if (isNilOrError(localSettings)) {
    return null;
  }

  return (
    <SectionFormWrapper
      breadcrumbs={breadcrumbs}
      title={title}
      stickyMenuContents={
        <SubmitWrapper
          status={formStatus}
          buttonStyle="primary"
          loading={isLoading}
          onClick={() => onSave(localSettings)}
          messages={{
            buttonSave: messages.heroBannerSaveButton,
            buttonSuccess: messages.heroBannerButtonSuccess,
            messageSuccess: messages.heroBannerMessageSuccess,
            messageError: messages.heroBannerError,
          }}
        />
      }
    >
      <Section key={'header'}>
        <Warning>
          <FormattedMessage {...messages.heroBannerInfoBar} />
        </Warning>

        <Outlet
          id="app.containers.Admin.settings.customize.headerSectionStart"
          bannerLayout={localSettings.banner_layout ?? 'two_column_layout'}
          handleOnChange={updateValueInLocalState}
        />
        <SubSectionTitle>
          <FormattedMessage {...messages.header_bg} />
          <IconTooltip
            content={
              <FormattedMessage
                {...messages.headerBgTooltip}
                values={{
                  supportPageLink: (
                    <a
                      href={formatMessage(messages.headerImageSupportPageURL)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FormattedMessage
                        {...messages.headerImageSupportPageText}
                      />
                    </a>
                  ),
                }}
              />
            }
          />
        </SubSectionTitle>
        <SectionField>
          {!isNilOrError(headerLocalDisplayImage) && (
            <>
              <Label>
                <FormattedMessage {...messages.bgHeaderPreviewSelectLabel} />
              </Label>
              <BgHeaderPreviewSelect
                options={[
                  {
                    value: 'desktop',
                    label: formatMessage(messages.desktop),
                  },
                  {
                    value: 'tablet',
                    label: formatMessage(messages.tablet),
                  },
                  {
                    value: 'phone',
                    label: formatMessage(messages.phone),
                  },
                ]}
                onChange={(option: IOption) => setPreviewDevice(option.value)}
                value={previewDevice}
              />
            </>
          )}
          <HeaderImageDropzone
            onAdd={bannerImageAddHandler}
            onRemove={bannerImageRemoveHandler}
            overlayColor={localSettings.banner_overlay_color}
            overlayOpacity={localSettings.banner_overlay_opacity}
            headerError={bannerError}
            header_bg={headerLocalDisplayImage}
            previewDevice={previewDevice}
            layout={localSettings.banner_layout || 'full_width_banner_layout'}
          />
        </SectionField>

        {/* We only allow the overlay for the full-width banner layout for the moment. */}
        {localSettings.banner_layout === 'full_width_banner_layout' &&
          headerLocalDisplayImage && (
            <>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.imageOverlayColor} />
                </Label>
                <ColorPickerInput
                  type="text"
                  value={
                    // default values come from the theme
                    localSettings.banner_overlay_color ?? theme.colorMain
                  }
                  onChange={handleOverlayColorOnChange}
                />
              </SectionField>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.imageOverlayOpacity} />
                </Label>
                <RangeInput
                  step={1}
                  min={0}
                  max={100}
                  value={
                    localSettings.banner_overlay_opacity ||
                    theme.signedOutHeaderOverlayOpacity
                  }
                  onChange={debouncedHandleOverlayOpacityOnChange}
                />
              </SectionField>
            </>
          )}
        <SectionField
          key={'banner_text'}
          data-cy="e2e-signed-out-header-section"
        >
          <SubSectionTitle>
            <FormattedMessage {...messages.bannerTextTitle} />
          </SubSectionTitle>
          <InputMultilocWithLocaleSwitcher
            type="text"
            valueMultiloc={localSettings.banner_header_multiloc}
            label={
              <Box display="flex" mr="20px">
                <FormattedMessage {...messages.bannerHeaderSignedOut} />
              </Box>
            }
            maxCharCount={TITLE_MAX_CHAR_COUNT}
            onChange={handleHeaderOnChange}
            errorMultiloc={headerAndSubheaderErrors.signedOutHeaderErrors}
          />
        </SectionField>
        <SectionField data-cy="e2e-signed-out-subheader-section">
          <InputMultilocWithLocaleSwitcher
            type="text"
            valueMultiloc={localSettings.banner_subheader_multiloc}
            label={formatMessage(messages.bannerHeaderSignedOutSubtitle)}
            maxCharCount={SUBTITLE_MAX_CHAR_COUNT}
            onChange={handleSubheaderOnChange}
            errorMultiloc={headerAndSubheaderErrors.signedOutSubheaderErrors}
          />
        </SectionField>
        {bannerMultilocFieldComponent}
        {avatarsFieldComponent}
        {outletSectionEnd}
      </Section>
    </SectionFormWrapper>
  );
};

export default injectIntl(GenericHeroBannerForm);
