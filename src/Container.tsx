import type { Author, Book } from "./models.js";
import supabase from "./supabase-client.js";
import { useEffect, useState } from 'react';

function Container() {

    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);

    useEffect(() => {
        fetchBook()
        fetchAuthors()
    }, []);

    // Ottenere tutti i libri con relativi autori
    async function fetchBook() {
        const { data, error } = await supabase
            .from('Libri')
            .select(`
                    id,titolo,published_year,
                    book_authors (author_id,
                    Autori (
                        id,
                        name, bio, birth_year)
                    )
                `);
        if (error) {
            console.error('Error fetching metrics: ', error);
            throw error;
        }
        console.log('Fetched books: ', data);
        setBooks(
            data.map((book: any) => ({
                ...book,
                book_authors: Array.isArray(book.book_authors)
                    ? book.book_authors.map((ba: any) => ({
                        ...ba,
                        Autori: Array.isArray(ba.Autori) ? ba.Autori[0] : ba.Autori
                    }))
                    : []
            }))
        );
    }

    async function fetchAuthors() {
        const { data, error } = await supabase
            .from('Autori')
            .select(`id,name,bio, birth_year,
                    book_authors (
                        book_id,
                        Libri (id,titolo, published_year)
                    )
                `);
        if (error) {
            console.error('Error fetching authors: ', error);
        }
        console.log('Fetched authors: ', data);
        setAuthors(
            (data ?? []).map((author: any) => ({
                ...author,
                book_authors: Array.isArray(author.book_authors)
                    ? author.book_authors.map((ba: any) => ({
                        ...ba,
                        Libri: Array.isArray(ba.Libri) ? ba.Libri[0] : ba.Libri
                    }))
                    : []
            }))
        );
    }

    // Eliminare un libro (e le relazioni collegate)
    async function deleteBook(id: number) {
        const { data, error } = await supabase
            .from('Libri')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Error deleting book: ', error);
            throw error;
        }
        fetchBook();
    }

    async function handleAddBook(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const titolo = formData.get("titolo") as string;
        const published_year = Number(formData.get("published_year"));
        const author_id = Number(formData.get("author_id"));
        const isbn = formData.get("isbn") as string;

        // 1. Insert book
        const { data: bookData, error: bookError } = await supabase
            .from('Libri')
            .insert([{ titolo, published_year, isbn }])
            .select()
            .single();

        if (bookError) {
            console.error('Error adding book:', bookError);
            return;
        }

        // 2. Associate book with author
        if (bookData && author_id) {
            const { error: assocError } = await supabase
                .from('book_authors')
                .insert([{ book_id: bookData.id, author_id }]);
            if (assocError) {
                console.error('Error associating book with author:', assocError);
            }
        }

        fetchBook();
        form.reset();
    }    
    
    return (
        <div className="dashboard-wrapper">
            <div className="chart-container">
                <h2>Add a New Book</h2>
                <form
                    onSubmit={handleAddBook}
                >
                    <input name="titolo" placeholder="Book Title" required />
                    <input name="published_year" type="number" placeholder="Published Year" required />
                    <input name="isbn" placeholder="ISBN" required />
                    <select name="author_id" required>
                        <option value="">Select Author</option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name}
                            </option>
                        ))}
                    </select>
                    <button type="submit">Add Book</button>
                </form>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Published Year</th>
                        <th>Authors</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                No books found. Add your first book above.
                            </td>
                        </tr>
                    ) : (
                        books.map((book) => (
                            <tr key={book.id} style={{ textAlign: 'left' } }>
                                <td>{book.id}</td>
                                <td>{book.titolo}</td>
                                <td>{book.published_year}</td>
                                <td>
                                    {Array.isArray((book as any).book_authors) && (book as any).book_authors.length > 0
                                        ? (book as any).book_authors
                                            .map((ba: any) => ba.Autori?.name)
                                            .filter(Boolean)
                                            .join(', ')
                                        : '—'}
                                </td>
                                <td>
                                    <button 
                                        className="delete" 
                                        onClick={() => deleteBook(book.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Container;