'use client';

import { ReactNode, Suspense } from 'react';
import { LazyImage } from './LazyLoadImage';

interface PostGridSectionProps {
  children: ReactNode;
}

export const PostGridSection = ({ children }: PostGridSectionProps) => {
  return (
    <section>
      <h2 className="sr-only">여우툰 목록</h2>
      <Suspense
        fallback={
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1 py-1">
            {Array.from({ length: 21 }).map((_, index) => {
              return (
                <li
                  key={index}
                  className="relative hover:brightness-75 aspect-square transition-all duration-300 bg-gray-600"
                >
                  <LazyImage src="" alt="" />
                </li>
              );
            })}
          </ul>
        }
      >
        {children}
      </Suspense>
    </section>
  );
};
