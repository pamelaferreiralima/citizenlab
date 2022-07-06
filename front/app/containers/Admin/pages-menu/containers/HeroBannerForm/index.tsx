import React, { useState, useMemo, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';

// components
// import Error from 'components/UI/Error';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import {
  Section,
  SectionField,
  SectionTitle,
  SectionDescription,
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

import {
  Box,
  Button,
  Select,
  IOption,
  Label,
  ColorPickerInput,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

// import HeaderImageDropzone from './HeaderImageDropzone';
import RangeInput from 'components/UI/RangeInput';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
// import Outlet from 'components/Outlet';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc } from 'typings';

// resources
import { isNilOrError } from 'utils/helperUtils';
// import { isCLErrorJSON } from 'utils/errorUtils';
import {
  IHomepageSettingsAttributes,
  updateHomepageSettings,
} from 'services/homepageSettings';
import useHomepageSettings from 'hooks/useHomepageSettings';

// utils
import { forOwn, size, trim, debounce } from 'lodash-es';
// import {
// createAddUploadHandler,
// createRemoveUploadHandler,
// createCoreMultilocHandler,
// } from 'containers/admin/settings/customize/createHandler';

const BgHeaderPreviewSelect = styled(Select)`
  margin-bottom: 20px;
`;

// constants
import { pagesAndMenuBreadcrumb, homeBreadcrumb } from '../../constants';
const TITLE_MAX_CHAR_COUNT = 45;
const SUBTITLE_MAX_CHAR_COUNT = 90;
export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

const HeroBannerForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const theme: any = useTheme();
  const homepageSettings = useHomepageSettings();

  const [isLoading, setIsLoading] = useState(false);
  // const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);
  const [headerAndSubheaderErrors, setHeaderAndSubheaderErrors] = useState<{
    signedOutHeaderErrors: Multiloc;
    signedOutSubheaderErrors: Multiloc;
  }>({
    signedOutHeaderErrors: {},
    signedOutSubheaderErrors: {},
  });
  const [localHomepageSettings, setLocalHomepageSettings] =
    useState<IHomepageSettingsAttributes | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  useEffect(() => {
    if (!isNilOrError(homepageSettings)) {
      setLocalHomepageSettings({
        ...homepageSettings.data.attributes,
        banner_layout:
          homepageSettings.data.attributes.banner_layout ||
          'full_width_banner_layout',
      });
    }
  }, [homepageSettings]);

  const onSave = async () => {
    if (localHomepageSettings) {
      setIsLoading(true);
      await updateHomepageSettings(localHomepageSettings);
      setIsLoading(false);
      console.log('saved');
    }
  };

  const updateValueInLocalState = (key: string, value: any) => {
    if (localHomepageSettings) {
      setLocalHomepageSettings({
        ...localHomepageSettings,
        [key]: value,
      });
    }
  };

  const handleOverlayColorOnChange = (color: string) => {
    updateValueInLocalState('banner_signed_out_header_overlay_color', color);
  };

  const handleOverlayOpacityOnChange = (opacity: number) => {
    updateValueInLocalState(
      'banner_signed_out_header_overlay_opacity',
      opacity
    );
  };

  const debounceHandleOverlayOpacityOnChange = debounce(
    handleOverlayOpacityOnChange,
    15
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

  // const layout =
  //   latestAppConfigSettings.customizable_homepage_banner?.layout ||
  //   'full_width_banner_layout';

  // const updateHeaderTitle = createCoreMultilocHandler(
  //   'header_title',
  //   setParentState
  // );

  // const updateHeaderSlogan = createCoreMultilocHandler(
  //   'header_slogan',
  //   setParentState
  // );

  // const updateOnboardingFallbackMessage = createCoreMultilocHandler(
  //   'custom_onboarding_fallback_message',
  //   setParentState
  // );

  // const handleAppConfigurationStyleChange = () => {
  // (key: string) => (value: unknown) => {
  //   // setParentState((state) => {
  //   //   return {
  //   //     attributesDiff: {
  //   //       ...state.attributesDiff,
  //   //       style: {
  //   //         ...get(state.attributesDiff, 'style', {}),
  //   //         [key]: value,
  //   //       },
  //   //     },
  //   //   };
  //   });
  // };

  const handleSignedOutHeaderOnChange = (titleMultiloc: Multiloc) => {
    const signedOutHeaderErrors = {};

    forOwn(titleMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        signedOutHeaderErrors[locale] = formatMessage(
          messages.titleMaxCharError
        );
      }
    });

    updateValueInLocalState('banner_signed_out_header_multiloc', titleMultiloc);
    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutHeaderErrors,
    }));
  };

  const handleSignedOutSubheaderOnChange = (subtitleMultiloc: Multiloc) => {
    const signedOutSubheaderErrors = {};

    forOwn(subtitleMultiloc, (subtitle, locale) => {
      if (size(trim(subtitle)) > 90) {
        signedOutSubheaderErrors[locale] = formatMessage(
          messages.subtitleMaxCharError
        );
      }
    });

    updateValueInLocalState(
      'banner_signed_out_subheader_multiloc',
      subtitleMultiloc
    );
    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutSubheaderErrors,
    }));
  };

  const handleSignedInHeaderOnChange = (titleMultiloc: Multiloc) => {
    console.log({ titleMultiloc });
    const titleError = {};

    forOwn(titleMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        titleError[locale] = formatMessage(messages.titleMaxCharError);
      }
    });

    updateValueInLocalState('banner_signed_in_header_multiloc', titleMultiloc);
  };

  // const headerBgOnAddHandler = createAddUploadHandler(
  //   'header_bg',
  //   setParentState
  // );
  // const headerBgOnRemoveHandler = createRemoveUploadHandler(
  //   'header_bg',
  //   setParentState
  // );

  // const handleHeaderBgOnRemove = () => {
  // headerBgOnRemoveHandler();
  // };

  if (isNilOrError(homepageSettings) || isNilOrError(localHomepageSettings)) {
    return null;
  }

  const {
    banner_layout,
    banner_avatars_enabled,
    header_bg,
    banner_signed_out_header_overlay_opacity,
    banner_signed_out_header_overlay_color,
    banner_signed_out_header_multiloc,
    banner_signed_out_subheader_multiloc,
    banner_signed_in_header_multiloc,
  } = localHomepageSettings;

  return (
    <SectionFormWrapper
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: formatMessage(homeBreadcrumb.label),
          linkTo: homeBreadcrumb.linkTo,
        },
        { label: formatMessage(messages.header) },
      ]}
      title="Bottom Info Section"
      stickyMenuContents={
        <Button disabled={isLoading} onClick={onSave}>
          Save Bottom Info Form
        </Button>
      }
    >
      <>
        <Section key={'header'}>
          <SectionTitle>
            <FormattedMessage {...messages.header} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.headerDescription} />
          </SectionDescription>
          {/* <Outlet
            id="app.containers.Admin.settings.customize.headerSectionStart"
            latestAppConfigSettings={latestAppConfigSettings}
            handleOnChange={handleSettingOnChange}
          /> */}
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
            {header_bg && (
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
            {/*             
            <HeaderImageDropzone
              onAdd={headerBgOnAddHandler}
              onRemove={handleHeaderBgOnRemove}
              latestAppConfigStyleSettings={latestAppConfigStyleSettings}
              headerError={headerError}
              header_bg={header_bg}
              previewDevice={previewDevice}
              layout={layout}
            /> */}
          </SectionField>

          {/* We only allow the overlay for the full-width banner layout for the moment. */}
          {banner_layout === 'full_width_banner_layout' && header_bg && (
            <>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.imageOverlayColor} />
                </Label>
                <ColorPickerInput
                  type="text"
                  value={
                    // default values come from the theme
                    banner_signed_out_header_overlay_color ?? theme.colorMain
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
                    banner_signed_out_header_overlay_opacity ||
                    theme.signedOutHeaderOverlayOpacity
                  }
                  onChange={debouncedHandleOverlayOpacityOnChange}
                />
              </SectionField>
            </>
          )}
          <SectionField key={'banner_text'}>
            <SubSectionTitle>
              <FormattedMessage {...messages.bannerTextTitle} />
            </SubSectionTitle>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={banner_signed_out_header_multiloc}
              label={
                <Box display="flex" mr="20px">
                  <FormattedMessage {...messages.bannerHeaderSignedOut} />
                </Box>
              }
              maxCharCount={TITLE_MAX_CHAR_COUNT}
              onChange={handleSignedOutHeaderOnChange}
              errorMultiloc={headerAndSubheaderErrors.signedOutHeaderErrors}
            />
          </SectionField>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={banner_signed_out_subheader_multiloc}
              label={formatMessage(messages.bannerHeaderSignedOutSubtitle)}
              maxCharCount={SUBTITLE_MAX_CHAR_COUNT}
              onChange={handleSignedOutSubheaderOnChange}
              errorMultiloc={headerAndSubheaderErrors.signedOutSubheaderErrors}
            />
          </SectionField>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={banner_signed_in_header_multiloc}
              label={formatMessage(messages.bannerHeaderSignedIn)}
              onChange={handleSignedInHeaderOnChange}
            />
          </SectionField>
          <SectionField key="avatars">
            <SubSectionTitle>
              <FormattedMessage {...messages.avatarsTitle} />
            </SubSectionTitle>
            <Setting>
              <ToggleLabel>
                <StyledToggle
                  checked={!!banner_avatars_enabled}
                  onChange={() => {
                    updateValueInLocalState(
                      'banner_avatars_enabled',
                      !banner_avatars_enabled
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
          {/* <Outlet
            id="app.containers.Admin.settings.customize.headerSectionEnd"
            latestAppConfigSettings={latestAppConfigSettings}
            handleOnChange={handleSettingOnChange}
            errors={errors}
          /> */}
        </Section>
      </>
    </SectionFormWrapper>
  );
};

export default injectIntl(HeroBannerForm);
