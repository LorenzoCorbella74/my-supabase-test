export type Book = {
    id: number;
    titolo: string;
    published_year: number;
    book_authors?: {
        author_id: number;
        Autori: {
            id: number;
            name: string;
            bio: string;
            birth_year: number;
        };
    }[];
};
export type Author = {
    id: number;
    name: string;
    bio: string;
    birth_year: number;
    book_authors?: {
        book_id: number;
        Libri: {
            id: number;
            titolo: string;
            published_year: number;
        };
    }[];
};