import Image from "next/image";

export function ImageWithCaption({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-8">
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-[var(--muted-foreground)] mt-3">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
