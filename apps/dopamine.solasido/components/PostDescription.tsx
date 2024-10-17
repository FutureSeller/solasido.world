import { GetPostByIdReturnType } from '@/queries/get-post-by-id';
import Link from 'next/link';
import { HashTag } from './HashTag';
import { Instagram } from './icons/Instagram';

export const PostDescription = ({
  post,
}: {
  post: GetPostByIdReturnType | null;
}) => {
  if (post === null) {
    return (
      <div className="p-4 text-white">
        <h2 className="text-xl font-semibold">
          앗! 알수없는 오류가 발생했어요.
        </h2>
      </div>
    );
  }

  return (
    <div className="py-4 text-white">
      <h2 className="text-base sm:text-xl font-semibold">
        <Link
          href={post.link}
          className="flex items-center focus:outline-none focus:ring-1 focus:ring-amber-300 hover:text-amber-500"
          target="_blank"
          rel="noreferrer"
          passHref
        >
          {post.title}
          <Instagram className="ml-1" aria-hidden />
        </Link>
      </h2>
      <p className="text-sm sm:text-base pt-2 break-keep">{post.description}</p>
      <div className="w-fit">
        <HashTag tag={post.TAG} />
      </div>
    </div>
  );
};
