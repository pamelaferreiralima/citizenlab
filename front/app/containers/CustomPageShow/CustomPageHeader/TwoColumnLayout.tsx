import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/Layouts/TwoColumnLayoutStyles';
import React from 'react';
import { ICustomPageData } from 'services/customPages';
import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import HeaderContent from './HeaderContent';

interface Props {
  pageData: ICustomPageData;
}

const TwoColumnLayout = ({ pageData }: Props) => {
  const pageAttributes = pageData.attributes;
  const imageUrl = pageAttributes.header_bg?.large;
  return (
    <Container data-cy="e2e-two-column-layout-container">
      {imageUrl && (
        <HeaderImage
          src={imageUrl}
          cover={true}
          fadeIn={false}
          isLazy={false}
          placeholderBg="transparent"
          alt=""
        />
      )}
      <HeaderContent
        fontColors="dark"
        hasHeaderBannerImage={imageUrl != null}
        pageAttributes={pageAttributes}
      />
      <AdminCustomPageEditButton pageId={pageData.id} />
    </Container>
  );
};

export default TwoColumnLayout;
