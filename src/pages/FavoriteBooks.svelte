<script lang="ts">
  import Book from "../components/Book.svelte";
  import bookInfo from "../data/BookInfo";
  import "./FavoriteBooks.css";
</script>

<div class="favorite-books-page">
  <div class="page-header">
    <div class="page-kicker">
      <span class="page-kicker-icon" aria-hidden="true">📖</span>
      <span>Curated Reading Room</span>
    </div>
    <h1>Favorite Books & Inscriptions</h1>
    <p class="page-subtitle">
      Volumes on natural philosophy, science fiction, wilderness memoirs, 
      and foundational engineering that have shaped my worldview.
    </p>
  </div>

  <div class="books-shelf-frame">
    <div class="books-grid">
      {#each bookInfo as book (book.title)}
        <Book
          path={book.path}
          title={book.title}
          quote={book.quote}
          goodreads={book.goodreads}
        />
      {/each}
    </div>
  </div>
</div>
