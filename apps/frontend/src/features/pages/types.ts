/** Strapi rich-text block element */
export interface StrapiBlock {
  type: string;
  children?: StrapiBlock[];
  text?: string;
  [key: string]: unknown;
}

/** Image asset returned by the CMS */
export interface MediaAsset {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

/** A CMS-driven page entity */
export interface Page {
  id: number;
  slug: string;
  title: string;
  content: StrapiBlock[];
  excerpt?: string;
  featuredImage?: MediaAsset;
  seoTitle?: string;
  seoDescription?: string;
}

/** Paginated response shape for the Pages collection endpoint */
export interface PageResponse {
  data: Page[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
