import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { get, has, isEmpty, omitBy } from 'lodash-es';

// components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Branding from './Branding';
import Header from './Header';
import ProjectHeader from './ProjectHeader';
import HomepageCustomizableSection from './HomepageCustomizableSection';
import Events from './Events';
import AllInput from './AllInput';

// style
import { withTheme } from 'styled-components';

// utils
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import getSubmitState from 'utils/getSubmitState';
import { isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  updateAppConfiguration,
  IUpdatedAppConfigurationProperties,
  IAppConfiguration,
  IAppConfigurationSettings,
} from 'services/appConfiguration';
import { toggleEvents, toggleAllInput } from 'services/navbar';

// typings
import { CLError, UploadFile, Locale, Multiloc } from 'typings';

interface Props {
  lang: string;
  theme: any;
}

interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
  homepage_info_multiloc?: Multiloc;
  logo?: UploadFile;
  header_bg?: UploadFile;
}

interface State {
  locale: Locale | null;
  attributesDiff: IAttributesDiff;
  tenant: IAppConfiguration | null;
  logo: UploadFile[] | null;
  header_bg: UploadFile[] | null;
  loading: boolean;
  errors: { [fieldName: string]: CLError[] };
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
  titleError: Multiloc;
  settings: Partial<IAppConfigurationSettings>;
  subtitleError: Multiloc;
  updateEventsInNavbar: boolean | null;
  updateAllInputInNavbar: boolean | null;
}

class SettingsCustomizeTab extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      attributesDiff: {},
      tenant: null,
      logo: null,
      header_bg: null,
      loading: false,
      errors: {},
      saved: false,
      logoError: null,
      headerError: null,
      titleError: {},
      subtitleError: {},
      settings: {},
      updateEventsInNavbar: null,
      updateAllInputInNavbar: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      combineLatest([locale$, tenant$])
        .pipe(
          switchMap(([locale, tenant]) => {
            const logoUrl = get(tenant, 'data.attributes.logo.large', null);
            const headerUrl = get(
              tenant,
              'data.attributes.header_bg.large',
              null
            );
            const settings = get(tenant, 'data.attributes.settings', {});

            const logo$ = logoUrl
              ? convertUrlToUploadFileObservable(logoUrl, null, null)
              : of(null);
            const headerBg$ = headerUrl
              ? convertUrlToUploadFileObservable(headerUrl, null, null)
              : of(null);

            return combineLatest([logo$, headerBg$]).pipe(
              map(([tenantLogo, tenantHeaderBg]) => ({
                locale,
                tenant,
                tenantLogo,
                tenantHeaderBg,
                settings,
              }))
            );
          })
        )
        .subscribe(
          ({ locale, tenant, tenantLogo, tenantHeaderBg, settings }) => {
            const logo = !isNilOrError(tenantLogo) ? [tenantLogo] : [];
            const header_bg = !isNilOrError(tenantHeaderBg)
              ? [tenantHeaderBg]
              : [];
            this.setState({ locale, tenant, logo, header_bg, settings });
          }
        ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subsription) => subsription.unsubscribe());
  }

  validate = (tenant: IAppConfiguration, attributesDiff: IAttributesDiff) => {
    const { formatMessage } = this.props.intl;
    const hasRemoteLogo = has(tenant, 'data.attributes.logo.large');
    const localLogoIsNotSet = !has(attributesDiff, 'logo');
    const localLogoIsNull = !localLogoIsNotSet && attributesDiff.logo === null;
    const logoError =
      !localLogoIsNull || (hasRemoteLogo && localLogoIsNotSet)
        ? null
        : formatMessage(messages.noLogo);
    const hasRemoteHeader = has(tenant, 'data.attributes.header_bg.large');
    const localHeaderIsNotSet = !has(attributesDiff, 'header_bg');
    const localHeaderIsNull =
      !localHeaderIsNotSet && attributesDiff.header_bg === null;
    const headerError =
      !localHeaderIsNull || (hasRemoteHeader && localHeaderIsNotSet)
        ? null
        : formatMessage(messages.noHeader);
    const hasTitleError = !isEmpty(omitBy(this.state.titleError, isEmpty));
    const hasSubtitleError = !isEmpty(
      omitBy(this.state.subtitleError, isEmpty)
    );

    this.setState({ logoError, headerError });

    return !logoError && !headerError && !hasTitleError && !hasSubtitleError;
  };

  save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { tenant, attributesDiff } = this.state;

    if (tenant && this.validate(tenant, attributesDiff)) {
      this.setState({ loading: true, saved: false });

      try {
        await updateAppConfiguration(
          attributesDiff as IUpdatedAppConfigurationProperties
        );

        const { updateEventsInNavbar, updateAllInputInNavbar } = this.state;

        if (updateEventsInNavbar !== null) {
          await toggleEvents({ enabled: updateEventsInNavbar });
        }

        if (updateAllInputInNavbar !== null) {
          await toggleAllInput({ enabled: updateAllInputInNavbar });
        }

        this.setState({
          loading: false,
          saved: true,
          attributesDiff: {},
          updateEventsInNavbar: null,
          updateAllInputInNavbar: null,
        });
      } catch (error) {
        if (isCLErrorJSON(error)) {
          this.setState({ loading: false, errors: error.json.errors });
        } else {
          this.setState({ loading: false, errors: error });
        }
      }
    }
  };

  getSetting = (setting: string) => {
    return (
      get(this.state.attributesDiff, `settings.${setting}`) ??
      get(this.state.tenant, `data.attributes.settings.${setting}`)
    );
  };

  render() {
    const { locale, tenant } = this.state;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const homepageInfoPage = tenant.data.attributes.homepage_info_multiloc;

      const {
        logo,
        header_bg,
        attributesDiff,
        logoError,
        headerError,
        titleError,
        subtitleError,
        errors,
        saved,
      } = this.state;

      const latestAppConfigStyleSettings = {
        ...tenant.data.attributes,
        ...attributesDiff,
      }.style;

      const latestAppConfigCoreSettings = {
        ...tenant.data.attributes,
        ...attributesDiff,
      }.settings.core;

      return (
        <form onSubmit={this.save}>
          <Branding
            logo={logo}
            logoError={logoError}
            setParentState={this.setState}
            getSetting={this.getSetting}
          />

          <Header
            header_bg={header_bg}
            headerError={headerError}
            titleError={titleError}
            subtitleError={subtitleError}
            latestAppConfigStyleSettings={latestAppConfigStyleSettings}
            latestAppConfigCoreSettings={latestAppConfigCoreSettings}
            setParentState={this.setState}
          />

          <ProjectHeader
            currentlyWorkingOnText={
              latestAppConfigCoreSettings?.['currently_working_on_text']
            }
            setParentState={this.setState}
          />

          <HomepageCustomizableSection
            homepageInfoMultiloc={
              attributesDiff.homepage_info_multiloc || homepageInfoPage
            }
            homepageInfoErrors={errors.homepage_info}
            setParentState={this.setState}
          />

          <Events setParentState={this.setState} getSetting={this.getSetting} />

          <AllInput setParentState={this.setState} />

          <SubmitWrapper
            loading={this.state.loading}
            status={getSubmitState({ errors, saved, diff: attributesDiff })}
            messages={{
              buttonSave: messages.save,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />
        </form>
      );
    }

    return null;
  }
}

export default withTheme(injectIntl<Props>(SettingsCustomizeTab));
