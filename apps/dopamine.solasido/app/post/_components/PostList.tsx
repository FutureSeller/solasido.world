import { Database } from '@/types/supabase';
import { LazyImage } from '../../../components/LazyLoadImage';

export const PostList = ({
  post,
}: {
  post: Database['public']['Tables']['POST']['Row'] | null;
}) => {
  return (
    <ul>
      {post?.images.map((image, idx) => (
        <li key={`${post.id}-${idx}`}>
          <LazyImage
            wrapperClassName="block w-full h-full relative pt-[100%] bg-gray-600"
            className="absolute z-10 top-0 left-0 z-10 w-full h-full object-cover apsect-squre"
            src={image}
            alt=""
          />
        </li>
      ))}
    </ul>
  );
};
