import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="grid grid-cols-4 gap-3 h-[500px]">
      {/* Main large image */}
      <div className="col-span-2 row-span-2 overflow-hidden rounded-xl">
        <img
          src={selectedImage}
          alt="Main room view"
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => setSelectedImage(images[0])}
        />
      </div>

      {/* Smaller images - top right */}
      <div className="overflow-hidden rounded-xl">
        <img
          src={images[1]}
          alt="Room detail 1"
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => setSelectedImage(images[1])}
        />
      </div>
      <div className="overflow-hidden rounded-xl">
        <img
          src={images[2]}
          alt="Room detail 2"
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => setSelectedImage(images[2])}
        />
      </div>

      {/* Smaller images - bottom right */}
      <div className="overflow-hidden rounded-xl">
        <img
          src={images[3]}
          alt="Room detail 3"
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => setSelectedImage(images[3])}
        />
      </div>
      <div className="overflow-hidden rounded-xl">
        <img
          src={images[4]}
          alt="Room detail 4"
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => setSelectedImage(images[4])}
        />
      </div>
    </div>
  );
}
