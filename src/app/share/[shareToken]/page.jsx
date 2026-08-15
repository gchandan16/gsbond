"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";

export default function QuotePage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Fetch API
  useEffect(() => {
    async function fetchData() {
      try {
        const resolvedParams = await params;
        const shareToken = resolvedParams.shareToken;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/share/${shareToken}`,
          {
            cache: "no-store",
          }
        );

        const result = await res.json();
        
        // console.log("result",result);

        if(!result) notFound(); 

        setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params]);

  // Close modal
  const closeModal = () => {
    setSelectedIndex(null);
    setSelectedImages([]);
  };

  // Next image
  const nextImage = () => {
    setSelectedIndex((prev) =>
      prev === selectedImages.length - 1 ? 0 : prev + 1
    );
  };

  // Prev image
  const prevImage = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? selectedImages.length - 1 : prev - 1
    );
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;

      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, selectedImages]);

  // Open modal
  const openGallery = (images, index) => {
    setSelectedImages(images);
    setSelectedIndex(index);
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container text-center mt-5">
        <div className="alert alert-danger">Error fetching quote</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mt-5 mb-5">
        <div className="card shadow-sm border-primary">
          <div className="card-header bg-primary text-white">
            <h2 className="mb-0">Quote Details</h2>
          </div>

          <div className="card-body">
            <p>
              <strong>Job ID:</strong> {data.id}
            </p>

            <p>
              <strong>Name:</strong> {data.name}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="badge bg-warning text-dark">
                {data.jobStatus}
              </span>
            </p>

            {/* BEFORE IMAGES */}
            <h5 className="mt-4">Before Images:</h5>

            <div className="d-flex flex-wrap gap-3">
              {data.beforeImages?.length > 0 ? (
                data.beforeImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="position-relative border rounded overflow-hidden shadow-sm"
                    style={{
                      width: "150px",
                      height: "150px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      openGallery(data.beforeImages, idx)
                    }
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
                      alt={`before-${idx}`}
                      fill
                      priority={idx === 0}
                      sizes="150px"
                      className="object-fit-cover"
                    />
                  </div>
                ))
              ) : (
                <p>No images</p>
              )}
            </div>

            {/* AFTER IMAGES */}
            <h5 className="mt-5">After Images:</h5>

            <div className="d-flex flex-wrap gap-3">
              {data.afterImages?.length > 0 ? (
                data.afterImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="position-relative border rounded overflow-hidden shadow-sm"
                    style={{
                      width: "150px",
                      height: "150px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      openGallery(data.afterImages, idx)
                    }
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
                      alt={`after-${idx}`}
                      fill
                      priority={idx === 0}
                      sizes="150px"
                      className="object-fit-cover"
                    />
                  </div>
                ))
              ) : (
                <p>No images</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {selectedIndex !== null && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
          onClick={closeModal}
        >
          {/* CONTENT */}
          <div
            className="position-relative"
            style={{
              width: "90vw",
              height: "90vh",
              maxWidth: "1200px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              className="btn btn-light position-absolute"
              style={{
                top: "10px",
                right: "10px",
                zIndex: 10,
                borderRadius: "50%",
                width: "45px",
                height: "45px",
                fontSize: "20px",
                fontWeight: "bold",
              }}
              onClick={closeModal}
            >
              ×
            </button>

            {/* PREV BUTTON */}
            {selectedImages.length > 1 && (
              <button
                className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
                style={{
                  zIndex: 10,
                  marginLeft: "10px",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  fontSize: "22px",
                }}
                onClick={prevImage}
              >
                ←
              </button>
            )}

            {/* NEXT BUTTON */}
            {selectedImages.length > 1 && (
              <button
                className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
                style={{
                  zIndex: 10,
                  marginRight: "10px",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  fontSize: "22px",
                }}
                onClick={nextImage}
              >
                →
              </button>
            )}

            {/* LARGE IMAGE */}
            <div className="position-relative w-100 h-100 rounded overflow-hidden">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${selectedImages[selectedIndex]}`}
                alt={`preview-${selectedIndex}`}
                fill
                priority
                sizes="100vw"
                className="object-fit-contain"
              />
            </div>

            {/* COUNTER */}
            <div
              className="position-absolute bottom-0 start-50 translate-middle-x text-white px-3 py-2 rounded mb-3"
              style={{
                background: "rgba(0,0,0,0.6)",
                fontSize: "14px",
              }}
            >
              {selectedIndex + 1} / {selectedImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}