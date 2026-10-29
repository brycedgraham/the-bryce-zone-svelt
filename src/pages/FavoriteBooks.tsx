import React from "react"
import Book from "../components/Book"
import bookInfo from "../data/BookInfo"
import "./FavoriteBooks.css"

const FavoriteBooks = () => {
  return (
    <div className="favorite-books-page">
      <div className="page-header">
        <div className="page-kicker">
          <span className="page-kicker-icon" aria-hidden="true">📖</span>
          <span>Curated Reading Room</span>
        </div>
        <h1>Favorite Books & Inscriptions</h1>
        <p className="page-subtitle">
          Volumes on natural philosophy, science fiction, wilderness memoirs, 
          and foundational engineering that have shaped my worldview.
        </p>
      </div>

      <div className="books-shelf-frame">
        <div className="books-grid">
          {bookInfo.map((book) => (
            <Book
              key={book.title}
              path={book.path}
              title={book.title}
              quote={book.quote}
              goodreads={book.goodreads}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FavoriteBooks