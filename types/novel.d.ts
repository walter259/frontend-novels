interface Novel {
    id: number;
    title: string;
    description: string;
    user_id: number;
    author: string | null;
    category_id: number;
    image: string | null;
    category: string | null;
    created_at: string;
    updated_at: string;
  }