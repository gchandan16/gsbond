"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const DisplayNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [token, setToken] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    // console.log("storedToken",storedToken)
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`,
            {
                headers:{
                    Authorization:`Bearer ${storedToken}`
                }
            }
        );
        setNotifications(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleClick = async (id) => {
    setModalLoading(true);

    // Open Bootstrap modal
    const { Modal } = await import("bootstrap");
    const modal = new Modal(modalRef.current);
    modal.show();

    try {
      // Mark as read (PUT)
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${id}`);

      // Fetch single notification (GET)
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${id}`);
      setSelectedNotification(res.data.data);

      // Update local read state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to update/fetch notification", err);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4 text-center text-muted">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold text-center">🔔 Notifications</h2>

      {notifications.length > 0 ? (
        <div className="row g-3">
          {notifications.map((i) => {
            const isSelected = i.id === selectedNotification?.id;

            const cardStyle = isSelected
              ? "bg-primary text-white shadow-lg"
              : i.read
              ? "bg-light"
              : "bg-primary text-white shadow-lg";

            return (
              <div className="col-12" key={i.id}>
                <div
                  className={`card shadow-sm border-0 rounded-4 ${cardStyle}`}
                  style={{ cursor: "pointer", transition: "0.3s" }}
                  onClick={() => handleClick(i.id)}
                >
                  <div className="card-body d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title mb-1">{i.title}</h5>
                      <p className="card-text mb-2 small">{i.description}</p>
                      <span className="badge bg-secondary">
                        {new Date(i.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      className={`btn btn-sm ${
                        isSelected ? "btn-light" : "btn-outline-primary"
                      } m-3`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(i.id);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted">No Notifications</div>
      )}

      {/* Bootstrap Modal */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">
                {modalLoading ? "Loading..." : selectedNotification?.title}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {modalLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                  <p className="mt-2 text-muted small">Fetching details...</p>
                </div>
              ) : (
                <>
                  <p>{selectedNotification?.description}</p>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      🕒 {new Date(selectedNotification?.createdAt).toLocaleString()}
                    </small>
                    <span className={`badge ${selectedNotification?.read ? "bg-success" : "bg-warning text-dark"}`}>
                      {selectedNotification?.read ? "Read" : "Unread"}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayNotification; 