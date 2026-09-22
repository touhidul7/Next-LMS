'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Logo link that navigates to "/" normally, but if already on "/"
 * it just smooth-scrolls to the top instead (no reload, no loader).
 */
export default function LogoHomeLink({ children, className }) {
  const pathname = usePathname();

  const handleClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link href="/" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
