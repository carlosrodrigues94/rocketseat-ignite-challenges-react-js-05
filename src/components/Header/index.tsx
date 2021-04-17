import Link from 'next/link';
import styles from './header.module.scss';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <Link href="/">
        <a>
          <div>
            <img src="/images/logo.svg" alt="logo" />
            <span>
              spacetraveling<b>.</b>
            </span>
          </div>
        </a>
      </Link>
    </header>
  );
};

export default Header;
