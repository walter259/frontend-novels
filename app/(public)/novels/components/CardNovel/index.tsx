// components/CardNovel.tsx
import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";



interface CardNovelProps {
  novel: Novel;
}

export default function CardNovel({ novel }: CardNovelProps) {
  const { title, description, image, category } = novel;

  return (
    <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex p-4 gap-4">
        {/* Book cover image */}
        <div className="flex-shrink-0">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={80}
            height={80}
            className="object-cover rounded-sm"
          />
        </div>

        {/* Book information */}
        <div className="flex-grow space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-1" title={title || ""}>
            {title}
          </h3>

          <div className="flex gap-3 text-xs text-muted-foreground">
            <Link href="#" className="hover:underline">
              {category || "Sin categoría"}
            </Link>
          </div>

          <p className="text-sm line-clamp-2" title={description || ""}>
            {description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="hidden md:flex flex-col gap-2 justify-center ml-auto">
          
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Haga clic para leer
            </Button>
         
          <Button variant="outline" className="border-gray-300">
            Añadir a la estantería
          </Button>
        </div>
      </div>
    </Card>
  );
}