import { useEffect, useRef, useState } from 'react';

interface ImageData {
    src: string;
    alt: string;
}

export interface Props {
    images: ImageData[];
}

export default function ImageSliderClient({ images }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollPrev(el.scrollLeft > 0);
        setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    useEffect(() => {
        updateScrollState();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollState);
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, []);

    const scrollByOneSlide = (direction: 'prev' | 'next') => {
        const el = scrollRef.current;
        if (!el) return;
        const slideWidth = el.clientWidth;
        el.scrollBy({
            left: direction === 'next' ? slideWidth : -slideWidth,
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative h-96 w-full">
            <div
                ref={scrollRef}
                className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth rounded-lg border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="region"
                aria-roledescription="carousel"
                aria-label="Image slider"
                tabIndex={0}
            >
                {images.map((image, index) => (
                    <a
                        key={index}
                        target="_blank"
                        href={image.src}
                        rel="noreferrer"
                        className="flex w-full flex-none snap-center snap-always items-center justify-center"
                        aria-roledescription="slide"
                        aria-label={`Slide ${index + 1} of ${images.length}`}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="!my-0 h-80 border-none object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                    </a>
                ))}
            </div>

            {/* Prev button */}
            <button
                type="button"
                onClick={() => scrollByOneSlide('prev')}
                disabled={!canScrollPrev}
                aria-label="Previous slide"
                className="bg-skin-card/80 text-skin-base ring-skin-line hover:bg-skin-card absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow ring-1 transition disabled:cursor-not-allowed disabled:opacity-30"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {/* Next button */}
            <button
                type="button"
                onClick={() => scrollByOneSlide('next')}
                disabled={!canScrollNext}
                aria-label="Next slide"
                className="bg-skin-card/80 text-skin-base ring-skin-line hover:bg-skin-card absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow ring-1 transition disabled:cursor-not-allowed disabled:opacity-30"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </div>
    );
}
