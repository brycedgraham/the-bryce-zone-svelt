import React, { useState, useEffect, useCallback, useRef } from "react"
import buildUrl from "build-url"
import { Gallery, Image } from "react-grid-gallery"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"

interface FlickrLightBoxProps {
  api_key: string
  user_id?: string
  album_id?: string
  limit?: number
  searchTerm?: string
  className?: string
  initialBatchSize?: number
  batchSize?: number
}

const FlickrLightBox = (props: FlickrLightBoxProps) => {
  const {
    initialBatchSize = 12,
    batchSize = 12,
    ...flickrProps
  } = props

  const [allImages, setAllImages] = useState<Image[]>([])
  const [displayedImages, setDisplayedImages] = useState<Image[]>([])
  const [index, setIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const generateApiUrl = useCallback((props: FlickrLightBoxProps) => {
    const extras = [
      "url_l",
      "url_m",
      "url_sq",
      "license",
      "date_upload",
      "date_taken",
      "icon_server",
      "original_format",
      "last_update",
      "geo",
      "tags",
      "machine_tags",
      "o_dims",
      "views",
      "media",
      "path_alias",
      "owner_name",
    ]
    return buildUrl("https://api.flickr.com", {
      path: "services/rest/",
      queryParams: {
        method:
          props.user_id || props.album_id || props.searchTerm
            ? "flickr.photosets.getPhotos"
            : "flickr.photos.getRecent",
        format: "json",
        api_key: props.api_key || "",
        user_id: props.user_id || "",
        photoset_id: props.album_id || "",
        text: props.searchTerm || "",
        per_page: (props.limit || Number.MAX_SAFE_INTEGER).toString(),
        nojsoncallback: "?",
        extras: extras.join(","),
      },
    })
  }, [])

  const queryFlickrApi = useCallback(async (props: FlickrLightBoxProps) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(generateApiUrl(props))
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (!data.photoset) {
        throw new Error("No photoset found in response")
      }

      const imageResponse: Image[] = data.photoset.photo
        .sort((a: any, b: any) => {
          return new Date(b.datetaken).getTime() - new Date(a.datetaken).getTime()
        })
        .map((p: any) => ({
          src: p.url_l || p.url_m || "https://s.yimg.com/pw/images/en-us/photo_unavailable.png",
          thumbnail: p.url_sq,
          thumbnailWidth: 150,
          thumbnailHeight: 150,
          caption: `${p.title || "Untitled"}: Photo by ${p.ownername}`,
          width: p.width_l || 1024,
          height: p.height_l || 768,
          alt: p.title || "Untitled photo",
        }))

      setAllImages(imageResponse)
      setDisplayedImages(imageResponse.slice(0, initialBatchSize))
    } catch (e) {
      console.error("Error fetching Flickr photos:", e)
      setError(e instanceof Error ? e.message : "Failed to load photos")
    } finally {
      setLoading(false)
    }
  }, [generateApiUrl, initialBatchSize])

  const loadMoreImages = useCallback(() => {
    if (loadingMore || displayedImages.length >= allImages.length) return

    setLoadingMore(true)
    
    // Simulate slight delay for smooth UX
    setTimeout(() => {
      const nextBatch = allImages.slice(
        displayedImages.length,
        displayedImages.length + batchSize
      )
      setDisplayedImages(prev => [...prev, ...nextBatch])
      setLoadingMore(false)
    }, 300)
  }, [allImages, displayedImages.length, batchSize, loadingMore])

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && displayedImages.length < allImages.length) {
          loadMoreImages()
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMoreImages, loadingMore, displayedImages.length, allImages.length])

  useEffect(() => {
    queryFlickrApi(flickrProps)
  }, [flickrProps.api_key, flickrProps.user_id, flickrProps.album_id, flickrProps.searchTerm, flickrProps.limit, queryFlickrApi])

  const handleClick = (index: number) => setIndex(index)

  const slides = allImages.map(({ src, width, height, caption, alt }) => ({
    src,
    width,
    height,
    title: caption || "",
    alt: alt || "",
  }))

  if (loading) {
    return (
      <div className={props.className} style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{
          display: "inline-block",
          width: "48px",
          height: "48px",
          border: "4px solid rgba(212, 154, 70, 0.2)",
          borderTopColor: "#d49a46",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ marginTop: "1rem", color: "#9ebd9b", fontFamily: "var(--font-serif, 'Lora', serif)", fontStyle: "italic" }}>
          Unpacking wilderness exposures...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className={props.className} style={{
        padding: "2.5rem 2rem",
        backgroundColor: "rgba(42, 28, 24, 0.85)",
        border: "1px solid rgba(212, 107, 70, 0.4)",
        borderRadius: "12px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "2rem auto"
      }}>
        <h3 style={{ color: "#f3cc83", marginBottom: "0.75rem", fontFamily: "var(--font-display, 'Cinzel', serif)" }}>
          Notice from the Field
        </h3>
        <p style={{ color: "#d6cfbe", marginBottom: "1.25rem" }}>{error}</p>
        <button
          onClick={() => queryFlickrApi(flickrProps)}
          style={{
            padding: "0.65rem 1.5rem",
            backgroundColor: "#d49a46",
            color: "#121f15",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "600",
            letterSpacing: "0.02em"
          }}
        >
          Retry Connection
        </button>
      </div>
    )
  }

  if (allImages.length === 0) {
    return (
      <div className={props.className} style={{ textAlign: "center", padding: "3rem", color: "#9ebd9b" }}>
        <p>No photos found in album.</p>
      </div>
    )
  }

  const hasMore = displayedImages.length < allImages.length

  return (
    <div className={props.className}>
      <div style={{ marginBottom: "1.25rem", color: "#9ebd9b", fontSize: "0.9rem", fontFamily: "var(--font-sans)" }}>
        Showing {displayedImages.length} of {allImages.length} photographs
      </div>

      <Gallery
        images={displayedImages}
        onClick={handleClick}
        enableImageSelection={false}
        rowHeight={200}
        margin={8}
      />

      {hasMore && (
        <div
          ref={loadMoreRef}
          style={{
            textAlign: "center",
            padding: "2.5rem",
            minHeight: "100px"
          }}
        >
          {loadingMore && (
            <>
              <div style={{
                display: "inline-block",
                width: "36px",
                height: "36px",
                border: "3px solid rgba(212, 154, 70, 0.2)",
                borderTopColor: "#d49a46",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
              <p style={{ marginTop: "0.75rem", color: "#9ebd9b", fontSize: "0.88rem" }}>Developing further exposures...</p>
            </>
          )}
        </div>
      )}

      <Lightbox
        slides={slides}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Zoom, Thumbnails]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
        thumbnails={{
          position: "bottom",
          width: 120,
          height: 80,
          border: 1,
          borderRadius: 4,
          padding: 4,
          gap: 16,
        }}
      />
    </div>
  )
}

export default FlickrLightBox