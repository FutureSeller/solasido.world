import { useEffect, useRef } from 'react';

interface InfiniteScrollObserverProps {
  onIntersect: () => void;
  options?: IntersectionObserverInit;
  children?: React.ReactNode;
}

export const InfiniteScrollObserver = ({
  onIntersect,
  options,
  children,
}: InfiniteScrollObserverProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observingElement = ref.current;
    if (!observingElement) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onIntersect();
      }
    }, options);

    observer.observe(observingElement);

    return () => {
      if (observingElement) {
        observer.unobserve(observingElement);
      }
    };
  }, [options, onIntersect]);

  return <div ref={ref}>{children}</div>;
};
