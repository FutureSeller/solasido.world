import Link from 'next/link';

export const Tag = (props: { tag: { name: string; slug: string | null } }) => {
  return props.tag?.name ? (
    <Link
      href={`/tag/${props.tag?.slug}`}
      className="flex px-4 py-1 text-xs sm:text-base rounded-full whitespace-nowrap border border-white active:bg-gray-700 transition-all duration-300 ease-in-out"
      scroll={false}
      prefetch={false}
      passHref
    >
      {props.tag?.name}
    </Link>
  ) : null;
};
