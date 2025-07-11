import Image from "next/image";
import Link from "next/link";

export default function MapInterface() {
  return (
    <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center space-y-4 mb-6 w-full max-w-sm border border-gray-200">
      <div className="w-full h-48 rounded-lg overflow-hidden">
        <Image
          src="/images/map.png"
          alt="Map preview"
          width={300}
          height={192}
          layout="responsive"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <Link
        href="#"
        className="text-primary font-medium text-lg hover:underline"
        aria-label="View map"
      >
        View in a map
      </Link>
    </div>
  );
}