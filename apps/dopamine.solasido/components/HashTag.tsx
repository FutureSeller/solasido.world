import Link from 'next/link';

export const HashTag = (props: {
  tag: { name: string; slug: string | null };
}) => {
  return props.tag?.name ? (
    <Link
      href={`/tag/${props.tag?.slug}`}
      className="flex py-2 text-xs text-blue-200 hover:text-amber-500 sm:text-base rounded-full whitespace-nowrap transition-all duration-300 ease-in-out"
      scroll={false}
      prefetch={false}
      passHref
    >
      #{props.tag.name}
    </Link>
  ) : null;
};
