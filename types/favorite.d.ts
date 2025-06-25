interface Favorite {
    id: number;
    user_id: number;
    novel_id: number;
    novel?: Novel | string;
    image: string;
  }