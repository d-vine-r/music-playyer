'use client';

interface HimageProps {
  photo: {
    id: number;
    src: { medium: string };
    alt: string;
    photographer: string;
  };
  className?: string;
}

export function Himage({ photo, className }: HimageProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img
        src={photo.src.medium}
        alt={photo.alt || `Photo by ${photo.photographer}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        {/* <p className="text-white text-sm">Photo by {photo.photographer}</p> */}
      </div>
    </div>
  );
}