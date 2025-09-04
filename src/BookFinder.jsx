
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BookFinder.css";

// debounce hook
function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function BookFinder() {
  const [name, setName] = useState("Alex");
  const [occupation, setOccupation] = useState("College Student");
  const [need, setNeed] = useState("");   // yeh hi search hoga

  const [page, setPage] = useState(1);
  const [data, setData] = useState({ docs: [], numFound: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const firstLoadRef = useRef(true);
  const debNeed = useDebounced(need);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (debNeed.trim()) params.set("title", debNeed.trim()); // sirf need/title pe search
    params.set("page", String(page));
    return params.toString();
  }, [debNeed, page]);

  useEffect(() => {
    if (!firstLoadRef.current) setPage(1);
  }, [debNeed]);

  useEffect(() => {
    const run = async () => {
      if (!debNeed.trim()) {
        setData({ docs: [], numFound: 0 });
        setError("");
        firstLoadRef.current = false;
        return;
      }
      setLoading(true);
      setError("");
      try {
        const url = `https://openlibrary.org/search.json?${query}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData({ docs: json.docs, numFound: json.numFound });
      } catch (e) {
        setError(e.message || "Failed to fetch");
      } finally {
        setLoading(false);
        firstLoadRef.current = false;
      }
    };
    run();
  }, [query]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => p + 1);

  return (
    <div className="shell">
      <h1>📚 Book Finder</h1>

      {/* Search Panel */}
      <div className="panel">
        <div className="row">
          <div>
            <label>Name</label>
            <input 
              placeholder="Enter Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div>
            <label>Occupation</label>
            <input 
              placeholder="Enter Occupation" 
              value={occupation} 
              onChange={(e) => setOccupation(e.target.value)} 
            />
          </div>
          <div>
            <label>Need (Book Title)</label>
            <input 
              placeholder="eg. The Alchemist" 
              value={need} 
              onChange={(e) => setNeed(e.target.value)} 
            />
          </div>
        </div>

        <div className="bar">
          <div className="count">
            {data.numFound > 0 ? (
              <>
                Found <strong>{data.numFound.toLocaleString()}</strong> results. 
                Showing page <strong>{page}</strong> from Open Library.
              </>
            ) : (
              <>No results yet. Try searching for a title.</>
            )}
          </div>
        </div>

        {loading && <p>⏳ Loading...</p>}
        {error && <p className="error">⚠️ {error}</p>}

        {/* Book Grid */}
        <div className="grid">
          {data.docs.map((book, i) => (
            <div className="card" key={i}>
              <div className="cover">
                {book.cover_i ? (
                  <img 
                    src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} 
                    alt={book.title} 
                  />
                ) : (
                  <span>No Image</span>
                )}
              </div>
              <div className="card-body">
                <div className="title">{book.title}</div>
               
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data.numFound > 0 && (
          <div className="pager">
            <button disabled={page === 1} onClick={onPrev}>⬅ Prev</button>
            <span>Page {page}</span>
            <button onClick={onNext}>Next ➡</button>
          </div>
        )}
      </div>
      <div className="footer">
        Made with ❤️ by <span className="Nam">Adarsh Thakare</span>

      </div>
    </div>
    
  );
}

