import { Carousel } from 'flowbite-react';
import type { CustomFlowbiteTheme } from 'flowbite-react';

interface ImageData {
    src: string;
    alt: string;
}

export interface Props {
    images: ImageData[];
}

const customTheme: CustomFlowbiteTheme['carousel'] = {
    root: {
        base: 'relative h-full w-full border',
    },
    scrollContainer: {
        base: 'flex h-full snap-mandatory overflow-hidden scroll-smooth rounded-lg',
    },
};

export default function ImageSliderClient({ images }: Props) {
    return (
        <div className="h-96">
            <Carousel slide={false} indicators={false} theme={customTheme}>
                {images.map((image, index) => (
                    <a
                        key={index}
                        target="_blank"
                        href={image.src}
                        rel="noreferrer"
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="!my-0 h-80 border-none object-contain"
                        />
                    </a>
                ))}
            </Carousel>
        </div>
    );
}
