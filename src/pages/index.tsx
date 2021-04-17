import { GetStaticProps } from 'next';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { getPrismicClient } from '../services/prismic';
import { FetchResponse, HomeProps, Pagination, Post } from '../types/post';
import styles from './home.module.scss';
import Header from '../components/Header';

function formatPostDate(date: Date | string): string {
  const formated = format(new Date(date), 'dd MMM yyyy', { locale: ptBR });

  return formated;
}

function parsePosts(data: ApiSearchResponse['results']): Post[] {
  const posts: Post[] = data.map(post => ({
    uid: post.uid,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
    first_publication_date: post.first_publication_date,
  }));

  return posts;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    next_page: null,
    page: 0,
    prev_page: null,
    results_per_page: 0,
    results_size: 0,
    total_pages: 0,
    total_results_size: 0,
  });

  const getNextPage = useCallback(async (): Promise<void> => {
    if (!pagination.next_page) return;

    const response: FetchResponse = await fetch(
      postsPagination.next_page
    ).then(data => data.json());

    const {
      results,
      next_page,
      total_results_size,
      total_pages,
      results_size,
      results_per_page,
      prev_page,
      page,
    } = response;

    setPagination({
      next_page,
      total_results_size,
      total_pages,
      results_size,
      results_per_page,
      prev_page,
      page,
    });

    const fetchedPosts = parsePosts(results);

    setPosts(oldState => [...oldState, ...fetchedPosts]);
  }, [postsPagination, pagination]);

  useEffect(() => {
    console.log('postsPagination', postsPagination);
    if (!postsPagination) return;
    setPosts(postsPagination.results);
    setPagination(oldState => ({
      ...oldState,
      next_page: postsPagination.next_page,
    }));
  }, [postsPagination]);

  return (
    <>
      <Header />
      <main className={styles.container}>
        {posts.map(post => (
          <Link
            href={`/post/${post.uid}`}
            key={post.uid ?? Math.random().toString()}
          >
            <a>
              <div className={styles.postContent}>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                    <FiCalendar /> {formatPostDate(post.first_publication_date)}
                  </span>
                  <span>
                    <FiUser /> {post.data.author}
                  </span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </main>
      {pagination.next_page && (
        <button
          className={styles.buttonNextPage}
          onClick={() => getNextPage()}
          type="button"
        >
          Carregar mais posts
        </button>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 5,
    }
  );

  const posts = parsePosts(postsResponse.results);

  const data: HomeProps['postsPagination'] = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return { props: { postsPagination: data } };
};
