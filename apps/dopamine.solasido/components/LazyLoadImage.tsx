'use client';

import {
  LazyLoadImage,
  LazyLoadImageProps,
} from 'react-lazy-load-image-component';

export const LazyImage = (props: LazyLoadImageProps) => (
  <LazyLoadImage
    wrapperClassName={props.wrapperClassName}
    className={props.className}
    src={props.src}
    alt={props.alt}
    visibleByDefault
  />
);
