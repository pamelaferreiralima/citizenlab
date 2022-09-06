import React, { useState, useMemo, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';

// components
import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';

import {
  Setting,
  ToggleLabel,
  StyledToggle,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from 'containers/Admin/settings/general';
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
import { UploadFile, Multiloc, CLErrors } from 'typings';
type MultilocErrorType = {
  signedOutHeaderErrors: Multiloc;
  signedOutSubheaderErrors: Multiloc;
};
export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';

// resources
import { IHomepageSettingsAttributes } from 'services/homepageSettings';

// utils
import { isNil, isNilOrError } from 'utils/helperUtils';
import { forOwn, size, trim, debounce } from 'lodash-es';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// constants
import Warning from 'components/UI/Warning';
import { ICustomPagesAttributes } from 'services/customPages';
const TITLE_MAX_CHAR_COUNT = 45;
const SUBTITLE_MAX_CHAR_COUNT = 90;

const BgHeaderPreviewSelect = styled(Select)`
  margin-bottom: 20px;
`;

// names differ slightly between HomePage and CustomPage
type Props = {
  type: 'homePage' | 'customPage';
  breadcrumbs: TBreadcrumbs;
  title?: string | JSX.Element;
  formStatus: ISubmitState;
  setFormStatus: (submitState: ISubmitState) => void;
  onSave: (inputSettingParameters: HeroBannerInputSettings) => void;
  isLoading: boolean;
  inputSettings: HeroBannerInputSettings;
  apiErrors?: CLErrors | null;
  hideSignedInCTASettings?: boolean;
  hideSignedInHeaderField?: boolean;
  hideAvatarsFields?: boolean;
};

export type HeroBannerInputSettings = {
  banner_layout:
    | IHomepageSettingsAttributes['banner_layout']
    | ICustomPagesAttributes['banner_layout'];
  banner_overlay_opacity:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_opacity']
    | ICustomPagesAttributes['banner_overlay_opacity'];
  banner_overlay_color:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_color']
    | ICustomPagesAttributes['banner_overlay_color'];
  banner_header_multiloc:
    | IHomepageSettingsAttributes['banner_signed_out_header_multiloc']
    | ICustomPagesAttributes['banner_header_multiloc'];
  banner_subheader_multiloc:
    | IHomepageSettingsAttributes['banner_signed_out_header_multiloc']
    | ICustomPagesAttributes['banner_header_multiloc'];
  header_bg:
    | IHomepageSettingsAttributes['header_bg']
    | ICustomPagesAttributes['header_bg'];

  // homepage only properties, optional
  banner_signed_in_header_multiloc?: IHomepageSettingsAttributes['banner_signed_in_header_multiloc'];
  banner_avatars_enabled?: IHomepageSettingsAttributes['banner_avatars_enabled'];
  // cta settings, only on homepage
  banner_cta_signed_in_text_multiloc?: IHomepageSettingsAttributes['banner_cta_signed_in_text_multiloc'];
  banner_cta_signed_in_type?: IHomepageSettingsAttributes['banner_cta_signed_in_type'];
  banner_cta_signed_in_url?: IHomepageSettingsAttributes['banner_cta_signed_in_url'];
  // cta_signed_out
  // this can be retyped since it exists on custom page too
  banner_cta_signed_out_text_multiloc: IHomepageSettingsAttributes['banner_cta_signed_out_text_multiloc'];
  banner_cta_signed_out_type: IHomepageSettingsAttributes['banner_cta_signed_out_type'];
  banner_cta_signed_out_url: IHomepageSettingsAttributes['banner_cta_signed_out_url'];
};

const GenericHeroBannerForm = ({
  type,
  onSave,
  inputSettings,
  setFormStatus,
  formStatus,
  isLoading,
  title,
  breadcrumbs,
  apiErrors,
  intl: { formatMessage },
  hideSignedInCTASettings = false,
  hideSignedInHeaderField = false,
  hideAvatarsFields = false,
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
    useState<HeroBannerInputSettings | null>({} as HeroBannerInputSettings);

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

  const handleSignedInHeaderOnChange = (titleMultiloc: Multiloc) => {
    // no length limit for signed-in header, only applies to homepage
    updateValueInLocalState('banner_signed_in_header_multiloc', titleMultiloc);
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
        {!hideSignedInHeaderField && (
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={localSettings.banner_signed_in_header_multiloc}
              label={formatMessage(messages.bannerHeaderSignedIn)}
              onChange={handleSignedInHeaderOnChange}
            />
          </SectionField>
        )}
        {!hideAvatarsFields && (
          <SectionField
            key="avatars"
            data-cy="e2e-banner-avatar-toggle-section"
          >
            <SubSectionTitle>
              <FormattedMessage {...messages.avatarsTitle} />
            </SubSectionTitle>
            <Setting>
              <ToggleLabel>
                <StyledToggle
                  checked={!!localSettings.banner_avatars_enabled}
                  onChange={() => {
                    updateValueInLocalState(
                      'banner_avatars_enabled',
                      !localSettings.banner_avatars_enabled
                    );
                  }}
                />
                <LabelContent>
                  <LabelTitle>
                    {formatMessage(messages.bannerDisplayHeaderAvatars)}
                  </LabelTitle>
                  <LabelDescription>
                    {formatMessage(messages.bannerDisplayHeaderAvatarsSubtitle)}
                  </LabelDescription>
                </LabelContent>
              </ToggleLabel>
            </Setting>
          </SectionField>
        )}
        {/* // CTA settings, only applicable on homepage */}
        <Outlet
          id="app.containers.Admin.settings.customize.headerSectionEnd"
          banner_cta_signed_in_text_multiloc={
            localSettings.banner_cta_signed_in_text_multiloc
          }
          banner_cta_signed_in_url={localSettings.banner_cta_signed_in_url}
          banner_cta_signed_in_type={localSettings.banner_cta_signed_in_type}
          banner_cta_signed_out_text_multiloc={
            localSettings.banner_cta_signed_out_text_multiloc
          }
          banner_cta_signed_out_url={localSettings.banner_cta_signed_out_url}
          banner_cta_signed_out_type={localSettings.banner_cta_signed_out_type}
          handleOnChange={updateValueInLocalState}
          // signed in only applies to
          showSignedInSettings={!hideSignedInCTASettings}
          errors={apiErrors}
        />
      </Section>
    </SectionFormWrapper>
  );
};

export default injectIntl(GenericHeroBannerForm);
