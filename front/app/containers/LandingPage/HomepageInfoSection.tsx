import React from 'react';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';
import T from 'components/T';
import ContentContainer from 'components/ContentContainer';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Fragment from 'components/Fragment';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const CustomSectionContentContainer = styled(ContentContainer)`
  width: 100%;
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 80px;
  padding-bottom: 80px;
  background: #fff;

  ${media.smallerThanMinTablet`
    padding-top: 40px;
    padding-bottom: 40px;
  `}
`;

const StyledQuillEditedContent = styled(QuillEditedContent)`
  h1,
  h2 {
    color: ${(props) => props.theme.colorText};
  }

  p,
  li {
    color: ${colors.label};
  }
`;

type Props = {
  sectionData: 'bottom_info_section_multiloc' | 'top_info_section_multiloc';
};

const HomepageInfoSection = ({ sectionData }: Props) => {
  const homepageSettings = useHomepageSettings();
  if (!isNilOrError(homepageSettings)) {
    const homepageInfoMultiloc = homepageSettings.data.attributes[sectionData];

    if (homepageInfoMultiloc && !isEmptyMultiloc(homepageInfoMultiloc)) {
      return (
        <CustomSectionContentContainer>
          <StyledQuillEditedContent>
            {/* what does this do */}
            <Fragment name={'pages/homepage_info/content'}>
              <T value={homepageInfoMultiloc} supportHtml={true} />
            </Fragment>
          </StyledQuillEditedContent>
        </CustomSectionContentContainer>
      );
    }
  }

  return null;
};

export default HomepageInfoSection;
