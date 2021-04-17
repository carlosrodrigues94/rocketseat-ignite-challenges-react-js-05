import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';

export interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

export interface PostPagination {
  next_page: string;
  results: Post[];
}

export interface HomeProps {
  postsPagination: PostPagination;
}

export type FetchResponse = {
  next_page: string | null;
  page: number;
  prev_page: string | null;
  results_per_page: number;
  results_size: number;
  total_pages: number;
  total_results_size: number;

  results: ApiSearchResponse['results'];
};

export type Pagination = Omit<FetchResponse, 'results'>;
