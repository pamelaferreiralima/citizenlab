import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { apiEndpoint as navbarEndpoint } from 'services/navbar';

export const apiEndpoint = `${API_PATH}/static_pages`;

// The following types all refer to the 'code' attribute of the page.

// The 'standard page' distinction is only relevant for non-commercial
// customers: they can edit the content of these pages, but nothing else.
// For commercial customers, these behave as 'custom' pages.
type TStandardPage = 'about' | 'faq';

export const STANDARD_PAGES: TStandardPage[] = ['about', 'faq'];

// Policy pages of which only the content can be edited
// in 'policy' tab in settings (both for non-commercial and
// commercial customers). Their codes are the same as their slugs.
export type TPolicyPage = 'terms-and-conditions' | 'privacy-policy';

export const POLICY_PAGES: TPolicyPage[] = [
  'terms-and-conditions',
  'privacy-policy',
];

export enum POLICY_PAGE {
  termsAndConditions = 'terms-and-conditions',
  privacyPolicy = 'privacy-policy',
}

export function isPolicyPageSlug(slug: string): slug is TPolicyPage {
  const termsAndConditionsSlug: TPolicyPage = POLICY_PAGE.termsAndConditions;
  const privacyPolicySlug: TPolicyPage = POLICY_PAGE.privacyPolicy;

  return slug === termsAndConditionsSlug || slug === privacyPolicySlug;
}

// Hardcoded pages don't actually exist in the database-
// their codes are the same as their slugs, which are used to render
// the footer. The slugs link to hard-coded components, see app/routes.ts.
type THardcodedPage = 'cookie-policy' | 'accessibility-statement';

// Pages in the footer.
export type TFooterPage = TPolicyPage | THardcodedPage;

export const FOOTER_PAGES: TFooterPage[] = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
  'accessibility-statement',
];

// Pages that exist in the static_pages database,
// but do not have a corresponding navbar item.
// Their slugs and titles cannot be changed. Their
// codes are the same as their slugs.
type TFixedPage = TPolicyPage | 'proposals';

export const FIXED_PAGES: TFixedPage[] = [
  'terms-and-conditions',
  'privacy-policy',
  'proposals',
];

// Everything about 'custom' pages can be changed: their
// title, navbar name, content and slug.
export type TPageCode = TStandardPage | TFixedPage | 'custom';

export interface IPageData {
  id: string;
  type: 'static_page';
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    nav_bar_item_title_multiloc: Multiloc;
    code: TPageCode;
    slug: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    nav_bar_item: {
      data: IRelationship | null;
    };
  };
}

interface IPageCreate {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: string;
}

export interface IPageUpdate {
  nav_bar_item_title_multiloc?: Multiloc;
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  slug?: string;
}

export interface IPage {
  data: IPageData;
}

export interface IPages {
  data: IPageData[];
}

export function listPages(streamParams: IStreamParams | null = null) {
  return streams.get<{ data: IPageData[] }>({
    apiEndpoint: `${apiEndpoint}`,
    ...streamParams,
  });
}

export function pageBySlugStream(
  pageSlug: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPage>({
    apiEndpoint: `${apiEndpoint}/by_slug/${pageSlug}`,
    ...streamParams,
  });
}

export function createPage(pageData: IPageCreate) {
  return streams.add<IPage>(`${apiEndpoint}`, { static_page: pageData });
}

export async function updatePage(pageId: string, pageData: IPageUpdate) {
  const response = await streams.update<IPage>(
    `${apiEndpoint}/${pageId}`,
    pageId,
    { static_page: pageData }
  );

  await streams.fetchAllWith({
    apiEndpoint: [navbarEndpoint],
  });

  return response;
}
export async function deletePage(pageId: string) {
  const response = await streams.delete(`${apiEndpoint}/${pageId}`, pageId);
  await streams.fetchAllWith({ apiEndpoint: [navbarEndpoint] });

  return response;
}

export function pageByIdStream(
  pageId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPage>({
    apiEndpoint: `${apiEndpoint}/${pageId}`,
    ...streamParams,
  });
}
