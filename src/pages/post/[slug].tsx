import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    author: string;
    banner: {
      url: string;
    };
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function formatTimeRead(textArr: string[]): { time: number; type: string } {
  const parseData = textArr
    .toString()
    .split(']')
    .join('')
    .split('[')
    .join('')
    .split(' ');
  const totalLetters = parseData.length;

  const count = Math.ceil(totalLetters / 200);

  const result =
    count > 60
      ? { time: count / 60, type: 'hrs' }
      : { time: count, type: 'min' };

  return result;
}

function formatPostDate(date: Date | string): string {
  const formated = format(new Date(date), 'dd MMM yyyy', { locale: ptBR });

  return formated;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const textBodyArr = post.data.content.map(content =>
    RichText.asText(content.body)
  );
  const textHeadingArr = post.data.content.map(content => content.heading);

  const { time, type } = formatTimeRead([...textBodyArr, ...textHeadingArr]);

  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={post?.data.banner.url.toString()} alt="banner" />
        <h1>{post.data.title}</h1>
        <div>
          <span>
            <FiCalendar /> {formatPostDate(post.first_publication_date)}
          </span>
          <span>
            <FiUser /> {post.data.author}
          </span>
          <span data-testid="time-min">
            <FiClock /> {`${time} ${type}`}
          </span>
        </div>
        <p />

        {post.data.content.map(content => (
          <>
            <span>{content.heading}</span>
            <div
              className={styles.bodyContent}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </>
        ))}
      </main>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post'],
      pageSize: 100,
    }
  );

  const paths = results.map(result => ({ params: { slug: result.uid } }));
  return {
    fallback: 'blocking',
    paths,
  };
};

type GetStatic = { slug: string };
export const getStaticProps: GetStaticProps<PostProps, GetStatic> = async ({
  params,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', slug, {});

  const post = {
    uid: response.uid,

    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
    first_publication_date: response.first_publication_date,
  };

  return {
    props: { post },
    revalidate: 30 * 60,
  };
};
