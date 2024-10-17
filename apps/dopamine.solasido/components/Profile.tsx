'use client';

import { Database } from '@/types/supabase';
import Link from 'next/link';
import { LazyImage } from './LazyLoadImage';
import { Instagram } from './icons/Instagram';

export const Profile = ({
  profile,
}: {
  profile: Database['public']['Tables']['PROFILE']['Row'] | null;
}) => {
  return (
    <header className="flex items-center border-b py-4">
      <Link
        className="block w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden mr-4 sm:mr-8 hover:brightness-75 transition-all duration-300 bg-gray-600"
        href={'/'}
      >
        {profile?.profile && (
          <LazyImage
            wrapperClassName="relative z-10 w-full h-full"
            className="absolute object-cover z-10 top-0 left-0 w-full h-full apsect-squre"
            src={profile.profile}
            alt=""
          />
        )}
      </Link>
      <div>
        <h1 className="font-semibold text-base sm:text-xl">{profile?.title}</h1>
        <Link
          href={profile?.link!}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-sm sm:text-base hover:text-amber-500"
        >
          <Instagram aria-hidden />
          solasido.pamine
        </Link>
        <div>
          {profile?.description.split('\n').map((v, index) => (
            <p key={index} className="text-xs sm:text-sm">
              {v}
            </p>
          ))}
        </div>
      </div>
    </header>
  );
};
