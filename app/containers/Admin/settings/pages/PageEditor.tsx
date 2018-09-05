// Libraries
import React from 'react';
import { Formik } from 'formik';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Components
import Icon from 'components/UI/Icon';
import PageForm, { FormValues } from 'components/PageForm';

// Services & resources
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import { createPage, updatePage, IPage } from 'services/pages';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Animations
import CSSTransition from 'react-transition-group/CSSTransition';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const timeout = 350;

const EditorWrapper = styled.div`
  margin-bottom: 35px;

  &:last-child {
    margin-bottom: 0px;
  }
`;

const DeployIcon = styled(Icon) `
  height: 12px;
  fill: ${colors.adminSecondaryTextColor};
  margin-right: 12px;
  transition: transform 200ms ease-out;
  transform: rotate(0deg);
`;

const Toggle = styled.div`
  color: ${colors.adminSecondaryTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &:hover,
  &.deployed {
    color: ${colors.adminTextColor};

    ${DeployIcon} {
      fill: ${colors.adminTextColor};
    }
  }

  &.deployed {
    ${DeployIcon} {
      transform: rotate(90deg);
    }
  }
`;

const EditionForm = styled.div`
  overflow: hidden;
  transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
  margin-top: 15px;
  max-width: 830px;

  &.page-enter {
    max-height: 0px;

    &.page-enter-active {
      max-height: 1000vh;
    }
  }

  &.page-exit {
    max-height: 1000vh;

    &.page-exit-active {
      max-height: 0px;
    }
  }
`;

// Typing
import { CLErrorsJSON } from 'typings';

interface DataProps {
  page: GetPageChildProps;
}
interface InputProps {
  className?: string;
  slug: string;
}
interface Props extends InputProps, DataProps { }

interface State {
  deployed: boolean;
}

class PageEditor extends React.PureComponent<Props, State>{
  constructor(props: Props) {
    super(props as any);
    this.state = {
      deployed: false,
    };
  }

  toggleDeploy = () => {
    this.setState({ deployed: !this.state.deployed });
  }

  initialValues = () => {
    const { page } = this.props;
    if (!isNilOrError(page)) {
      return {
        title_multiloc: page.attributes.title_multiloc,
        slug: page.attributes.slug,
        body_multiloc: page.attributes.body_multiloc,
      };
    } else {
      return {
        title_multiloc: { en: this.props.slug },
        body_multiloc: {},
      };
    }
  }

  handleSubmit = (values: FormValues, { setSubmitting, setErrors, setStatus, resetForm }) => {
    const { page } = this.props;

    let savePromise: Promise<IPage> | null = null;

    if (page === undefined) {
      return;
    } else {
      setSubmitting(true);
      setStatus(null);
      if (isNilOrError(page)) {
        savePromise = createPage(values);
      } else {
        savePromise = updatePage(page.id, values);
      }
    }
    savePromise.catch((errorResponse) => {
      const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
      setErrors(apiErrors);
      setSubmitting(false);
    }).then(() => {
      resetForm();
      setStatus('success');
    });
  }

  renderForm = (props) => (
    <PageForm
      {...props}
      mode="simple"
      hideTitle={this.props.slug !== 'information'}
    />
  )

  render() {
    const { deployed } = this.state;
    const { className, slug, page } = this.props;

    return (
      <EditorWrapper className={`${className} e2e-page-editor editor-${slug}`}>
        <Toggle onClick={this.toggleDeploy} className={`${deployed && 'deployed'}`}>
          <DeployIcon name="chevron-right" />
          {messages[slug] ? <FormattedMessage {...messages[slug]} /> : slug}
        </Toggle>

          <CSSTransition
            in={deployed}
            timeout={timeout}
            mountOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
            classNames="page"
          >
            <EditionForm>
              {page !== undefined &&
              <Formik
                initialValues={this.initialValues()}
                onSubmit={this.handleSubmit}
                render={this.renderForm}
                validate={PageForm.validate}
                mode="new"
                slug={slug}
              />
            }
            </EditionForm>
          </CSSTransition>
      </EditorWrapper>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetPage slug={inputProps.slug}>
    {page => <PageEditor {...inputProps} page={page} />}
  </GetPage>
);
