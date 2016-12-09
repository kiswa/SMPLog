export interface Post {
    id: number;
    title: string;
    text: string;
    short_text: string;
    slug: string;
    is_published: boolean | string;
    publish_date: number;
}

