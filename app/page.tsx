import BookCard from "@/components/BookCard";
import Hero from "@/components/hero";
import { sampleBooks } from "@/lib/constants";

const Home = () => {
  return (
    <main className="wrapper container">
      <Hero />
      <div className="library-books-grid">
        {sampleBooks.map((book) => (
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
