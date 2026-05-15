import BookCard from "@/components/BookCard";
import Hero from "@/components/hero";
import { getAllBooks } from "@/lib/actions/book.actions";
// import { sampleBooks } from "@/lib/constants";

export const dynamic = "force-dynamic";

const Home = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) => {
  const { query } = await searchParams;

  const bookResult = await getAllBooks(query);
  const books = bookResult.success ? bookResult.data ?? [] : [];
  return (
    <main className="wrapper container">
      <Hero />
      <div className="library-books-grid">
        {books.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))}
      </div>
    </main>
  );
};

export default Home;
