'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export const PostOrderFilter = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams.get('order') ?? 'desc';

  return (
    <nav className="flex items-center justify-end py-2">
      <Link
        href={`${pathname}?order=desc`}
        className={[
          'block text-sm hover:text-amber-500 sm:text-base',
          order !== 'asc' && 'text-amber-500',
        ].join(' ')}
        prefetch={false}
        replace
        passHref
      >
        최신화부터 보기
      </Link>
      <div className="not-sr-only bg-gray-300 w-0.5 h-4 mx-2"></div>
      <Link
        href={`${pathname}?order=asc`}
        className={[
          'block text-sm hover:text-amber-500 sm:text-base',
          order === 'asc' && 'text-amber-500',
        ].join(' ')}
        prefetch={false}
        replace
        passHref
      >
        첫화부터 보기
      </Link>
    </nav>
  );
};
