import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface FavoriteCardProps {
  favorite: Favorite;
}

export default function FavoriteCard({ favorite }: FavoriteCardProps) {
  const { novel, image, novel_id } = favorite;
  const router = useRouter();

  // Manejo seguro: si novel es string, úsalo como título; si es objeto, usa .title
  const title = typeof novel === "object" && novel !== null ? novel.title : typeof novel === "string" ? novel : undefined;
  const cover = image || (typeof novel === "object" && novel !== null && novel.image) || "/no-image.png";

  return (
    <Card
      className="overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-2"
      onClick={() => router.push(`/book/${novel_id}`)}
    >
      <div className="flex-shrink-0">
        <Image
          src={cover}
          alt={title || "Portada de novela sin título"}
          width={80}
          height={80}
          className="object-cover rounded-sm"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-lg leading-tight line-clamp-1">
          {title || "Sin título"}
        </h3>
      </div>
    </Card>
  );
}
