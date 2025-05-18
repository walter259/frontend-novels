import {
  Card,
} from "@/components/ui/card";
import Image from "next/image";


interface FavoriteCardProps {
  favorite: Favorite;
}

export default function FavoriteCard({ favorite }: FavoriteCardProps) {
  const { novel, image } = favorite;

  return (
    <Card className="overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-2">
      <div className="flex-shrink-0">
        <Image
          src={image || "/aaa.png"}
          alt={novel || "Portada de novela sin título"}
          width={80}
          height={80}
          className="object-cover rounded-sm"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-lg leading-tight line-clamp-1">
          {novel || "Sin título"}
        </h3>
      </div>
    </Card>
  );
}