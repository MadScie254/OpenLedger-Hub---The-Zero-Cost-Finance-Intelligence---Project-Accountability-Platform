'use client';

/** Resource Library Tab - Search books and educational resources */

import { useState } from 'react';

interface ResourceLibraryProps {
    apiUrl: string;
}

export default function ResourceLibraryTab({ apiUrl }: ResourceLibraryProps) {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const searchBooks = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/external/books/search?q=${encodeURIComponent(query)}&limit=12`);
            if (res.ok) {
                const data = await res.json();
                setBooks(data.results);
            }
        } catch (error) {
            console.error('Error searching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') searchBooks();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Resource Library</h2>
                <p className="text-gray-400 mt-1">Search educational resources and books</p>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for books, guides, manuals..."
                    className="glass-input"
                />
                <button
                    onClick={searchBooks}
                    disabled={loading || !query.trim()}
                    className="btn-primary"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {books.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book, idx) => (
                        <div key={idx} className="glass-panel p-4 rounded-xl hover-glow transition-all cursor-pointer">
                            <h4 className="text-white font-semibold mb-2 line-clamp-2">{book.title}</h4>
                            {book.authors && book.authors.length > 0 && (
                                <p className="text-gray-400 text-sm mb-2">by {book.authors.join(', ')}</p>
                            )}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                <span className="text-electric-blue text-sm">
                                    {book.first_publish_year || 'Unknown year'}
                                </span>
                                {book.isbn && (
                                    <span className="text-gray-500 text-xs">ISBN: {book.isbn}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {books.length === 0 && !loading && (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">📚</p>
                    <p className="text-gray-400">Search for books and educational resources</p>
                    <p className="text-gray-500 text-sm mt-2">Try searching: "agriculture", "health", "education", "finance"</p>
                </div>
            )}

            <style jsx>{`
        .glass-panel {
          background: rgba(20, 20, 30, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 211, 238, 0.1);
        }
        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.2);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
}
