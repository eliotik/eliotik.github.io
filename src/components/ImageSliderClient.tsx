interface ImageData {
    src: string;
    alt: string;
}

export interface Props {
    images: ImageData[];
}

export default function ImageSliderClient({ images }: Props) {
    return (
        <div
            className="scrollbar-thin relative flex h-96 w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth rounded-lg border"
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
    );
}
