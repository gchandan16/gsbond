"use client";

import React, { useMemo, useState } from "react";
import axios from "axios";
import { redirect } from "next/navigation";
export default function AllLeadsTable({
    initialLeads = []
}) {

    const [leads] = useState(initialLeads);

    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [selectedLead, setSelectedLead] = useState(null);
    const [sortColumn, setSortColumn] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");

    const perPage = 10;


    /* ============================================================
       SEARCH
    ============================================================ */

    const filteredLeads = useMemo(() => {

        const searchText = search
            .trim()
            .toLowerCase();

        if (!searchText) {
            return leads;
        }

        return leads.filter((lead) => {

            return [

                lead.id,
                lead.name,
                lead.email,
                lead.phone,
                lead.suburb,
                lead.postcode,
                lead.state,
                lead.houseType,
                lead.bedroom,
                lead.bathroom,
                lead.message,
                ...(lead.services || []),
                ...(lead.contactMethods || [])

            ].some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(searchText)
            );

        });

    }, [leads, search]);


    const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads];

    sorted.sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        if (sortColumn === "createdAt") {
            valueA = new Date(valueA).getTime();
            valueB = new Date(valueB).getTime();
        } else {
            valueA = String(valueA ?? "").toLowerCase();
            valueB = String(valueB ?? "").toLowerCase();
        }

        if (valueA < valueB) {
            return sortDirection === "asc" ? -1 : 1;
        }

        if (valueA > valueB) {
            return sortDirection === "asc" ? 1 : -1;
        }

        return 0;
    });

    return sorted;
}, [filteredLeads, sortColumn, sortDirection]);


    /* ============================================================
       PAGINATION
    ============================================================ */

    const totalPages = Math.ceil(
        filteredLeads.length / perPage
    );

    const paginatedLeads = sortedLeads.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );


    /* ============================================================
       SEARCH HANDLER
    ============================================================ */

    const handleSearch = (e) => {

        setSearch(e.target.value);

        setCurrentPage(1);

    };


    /* ============================================================
       INITIALS
    ============================================================ */

    const getInitials = (name = "") => {

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((item) => item[0])
            .join("")
            .toUpperCase();

    };


    /* ============================================================
       SERVICES
    ============================================================ */

    const getServices = (lead) => {

        if (
            lead.services &&
            lead.services.length > 0
        ) {
            return lead.services;
        }

        return ["Cleaning"];

    };


    /* ============================================================
       STATUS
       
       We are NOT creating a new status system.
       Just display whatever API sends.
    ============================================================ */

    const getStatus = (status) => {

        if (
            status === 0 ||
            status === "0"
        ) {
            return "New";
        }

        return status || "—";

    };


    /* ============================================================
       STATUS BADGE
    ============================================================ */

    const getStatusClass = (status) => {

        if (
            status === 0 ||
            status === "0"
        ) {
            return "bg-primary bg-opacity-10 text-primary";
        }

        return "bg-secondary bg-opacity-10 text-secondary";

    };


    return (
        <>

            {/* ====================================================
                LEAD DETAILS MODAL
            ==================================================== */}

            {selectedLead && (

                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)"
                    }}
                >

                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className="modal-content border-0 rounded-4 shadow">


                            {/* Header */}

                            <div className="modal-header border-bottom border-primary border-opacity-25">

                                <div>

                                    <h5 className="modal-title fw-bold mb-1">

                                        Lead Details

                                    </h5>

                                    <div className="small text-secondary">

                                        Lead #{selectedLead.id}

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() =>
                                        setSelectedLead(null)
                                    }
                                />

                            </div>


                            {/* Body */}

                            <div className="modal-body">

                                <div className="row g-3">


                                    {/* Customer */}

                                    <div className="col-12">

                                        <div className="card border-0 bg-primary bg-opacity-10 rounded-4">

                                            <div className="card-body">

                                                <div className="d-flex align-items-center gap-3">

                                                    <div
                                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                                        style={{
                                                            width: 48,
                                                            height: 48
                                                        }}
                                                    >
                                                        {getInitials(
                                                            selectedLead.name
                                                        )}
                                                    </div>

                                                    <div>

                                                        <div className="fw-bold">

                                                            {selectedLead.name ||
                                                                "Unknown Customer"}

                                                        </div>

                                                        <div className="small text-secondary">

                                                            {selectedLead.email ||
                                                                "No email"}

                                                        </div>

                                                        <div className="small text-secondary">

                                                            {selectedLead.phone ||
                                                                "No phone"}

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    {/* Contact */}

                                    <div className="col-md-6">

                                        <div className="border rounded-4 p-3 h-100">

                                            <div className="small text-secondary mb-2">

                                                CONTACT

                                            </div>


                                            <div className="fw-semibold mb-2">

                                                Contact Methods

                                            </div>


                                            <div>

                                                {selectedLead.contactMethods?.length
                                                    ? selectedLead.contactMethods.map(
                                                        (method) => (

                                                            <span
                                                                key={method}
                                                                className="badge bg-primary bg-opacity-10 text-primary rounded-pill me-1 mb-1"
                                                            >
                                                                {method}
                                                            </span>

                                                        )
                                                    )
                                                    : (
                                                        <span className="text-secondary small">
                                                            Not specified
                                                        </span>
                                                    )}

                                            </div>


                                            <div className="fw-semibold mt-3 mb-1">

                                                Best Time

                                            </div>


                                            <div className="small text-secondary">

                                                {selectedLead.bestTimeToContact?.length
                                                    ? selectedLead.bestTimeToContact.join(
                                                        ", "
                                                    )
                                                    : "Not specified"}

                                            </div>

                                        </div>

                                    </div>


                                    {/* Property */}

                                    <div className="col-md-6">

                                        <div className="border rounded-4 p-3 h-100">

                                            <div className="small text-secondary mb-2">

                                                PROPERTY

                                            </div>


                                            <div className="row g-2">

                                                <div className="col-6">

                                                    <div className="small text-secondary">
                                                        Type
                                                    </div>

                                                    <div className="fw-semibold">
                                                        {selectedLead.houseType || "—"}
                                                    </div>

                                                </div>


                                                <div className="col-6">

                                                    <div className="small text-secondary">
                                                        Bedroom
                                                    </div>

                                                    <div className="fw-semibold">
                                                        {selectedLead.bedroom || "—"}
                                                    </div>

                                                </div>


                                                <div className="col-6">

                                                    <div className="small text-secondary">
                                                        Bathroom
                                                    </div>

                                                    <div className="fw-semibold">
                                                        {selectedLead.bathroom || "—"}
                                                    </div>

                                                </div>


                                                <div className="col-6">

                                                    <div className="small text-secondary">
                                                        Furnished
                                                    </div>

                                                    <div className="fw-semibold">
                                                        {selectedLead.furnished || "—"}
                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    {/* Location */}

                                    <div className="col-12">

                                        <div className="border rounded-4 p-3">

                                            <div className="small text-secondary mb-2">

                                             Suburb &  LOCATION  

                                            </div>

                                            <div className="fw-semibold">

                                                {selectedLead.suburb || "—"}

                                                {selectedLead.state && (
                                                    <>
                                                        {" , "}
                                                        {selectedLead.state}
                                                    </>
                                                )}

                                                {selectedLead.postcode && (
                                                    <>
                                                        {" "}
                                                        {selectedLead.postcode}
                                                    </>
                                                )}

                                            </div>

                                        </div>

                                    </div>


                                    {/* Services */}

                                    <div className="col-12">

                                        <div className="border rounded-4 p-3">

                                            <div className="small text-secondary mb-2">

                                                SERVICES

                                            </div>

                                            {getServices(
                                                selectedLead
                                            ).map(
                                                (service) => (

                                                    <span
                                                        key={service}
                                                        className="badge bg-primary bg-opacity-10 text-primary rounded-pill me-1 mb-1"
                                                    >
                                                        {service}
                                                    </span>

                                                )
                                            )}

                                        </div>

                                    </div>


                                    {/* Message */}

                                    {selectedLead.message && (

                                        <div className="col-12">

                                            <div className="border rounded-4 p-3">

                                                <div className="small text-secondary mb-2">

                                                    CUSTOMER MESSAGE

                                                </div>

                                                <div
                                                    className="small"
                                                    style={{
                                                        whiteSpace:
                                                            "pre-line"
                                                    }}
                                                >
                                                    {selectedLead.message}
                                                </div>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* Footer */}

                            <div className="modal-footer border-top border-primary border-opacity-25">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary rounded-3"
                                    onClick={() =>
                                        setSelectedLead(null)
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ====================================================
                SUMMARY CARDS
            ==================================================== */}

            <div className="row g-3 mb-4">

                <div className="col-12 col-md-4">

                    <div className="card border-0 shadow-sm rounded-4 px-4 py-3">

                        <div className="d-flex align-items-center gap-3">

                            <div
                                className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-3"
                                style={{
                                    width: 44,
                                    height: 44,
                                    fontSize: 20
                                }}
                            >
                                👥
                            </div>

                            <div>

                                <div className="fw-bold fs-5 text-primary font-monospace">

                                    {leads.length}

                                </div>

                                <div className="text-secondary small">

                                    Total Leads

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <div className="col-12 col-md-4">

                    <div className="card border-0 shadow-sm rounded-4 px-4 py-3">

                        <div className="d-flex align-items-center gap-3">

                            <div
                                className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-3"
                                style={{
                                    width: 44,
                                    height: 44,
                                    fontSize: 20
                                }}
                            >
                                📋
                            </div>

                            <div>

                                <div className="fw-bold fs-5 text-success font-monospace">

                                    {filteredLeads.length}

                                </div>

                                <div className="text-secondary small">

                                    Showing Leads

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <div className="col-12 col-md-4">

                    <div className="card border-0 shadow-sm rounded-4 px-4 py-3">

                        <div className="d-flex align-items-center gap-3">

                            <div
                                className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-3"
                                style={{
                                    width: 44,
                                    height: 44,
                                    fontSize: 20
                                }}
                            >
                                🔗
                            </div>

                            <div>

                                <div className="fw-bold fs-5 text-warning font-monospace">

                                    {
                                        leads.filter(
                                            (lead) =>
                                                lead.quoteId
                                        ).length
                                    }

                                </div>

                                <div className="text-secondary small">

                                    Converted to Quote

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ====================================================
                MAIN TABLE CARD
            ==================================================== */}

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">


                {/* =================================================
                    HEADER / SEARCH
                ================================================= */}

                <div className="card-header bg-white border-bottom border-primary border-opacity-25 px-4 py-3">

                    <div className="row g-2 align-items-center">


                        <div className="col-12 col-md-6">

                            <div className="input-group">

                                <span className="input-group-text bg-white border-end-0 text-primary">

                                    🔍

                                </span>

                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Search name, email, phone, suburb..."
                                    value={search}
                                    onChange={handleSearch}
                                />

                            </div>

                        </div>


                        <div className="col-12 col-md-6">

                            <div className="d-flex justify-content-md-end align-items-center">

                                <span className="text-secondary small">

                                    {filteredLeads.length}{" "}

                                    {filteredLeads.length === 1
                                        ? "lead"
                                        : "leads"
                                    }

                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0">

                        <thead className="table-primary">

                            <tr>

                                <th className="ps-4">
                                    #
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Contact
                                </th>

                                <th>
                                     Suburb-Location 
                                </th>

                                

                                <th>
                                    Services
                                </th>

                                <th>
                                    Status
                                </th>

                               <th
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        if (sortColumn === "createdAt") {
                                            setSortDirection(
                                                sortDirection === "asc" ? "desc" : "asc"
                                            );
                                        } else {
                                            setSortColumn("createdAt");
                                            setSortDirection("desc");
                                        }
                                    }}
                                >
                                    Date {sortColumn === "createdAt" && (
                                        sortDirection === "asc" ? " ↑" : " ↓"
                                    )}
                                </th>

                                <th className="text-center">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {paginatedLeads.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="text-center py-5"
                                    >

                                        <div
                                            style={{
                                                fontSize: 40
                                            }}
                                        >
                                            📋
                                        </div>

                                        <div className="fw-semibold mt-2">

                                            No leads found

                                        </div>

                                        <div className="text-secondary small">

                                            Try another search term

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                paginatedLeads.map(
                                    (lead, index) => (

                                        <tr key={lead.id}>


                                            {/* # */}

                                            <td className="ps-4">

                                                <span className="text-secondary small">

                                                    {(currentPage - 1) *
                                                        perPage +
                                                        index +
                                                        1}

                                                </span>

                                            </td>


                                            {/* Customer */}

                                            <td>

                                                <div className="d-flex align-items-center gap-2">

                                                    <div
                                                        className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            fontSize: 11
                                                        }}
                                                    >

                                                        {getInitials(
                                                            lead.name
                                                        )}

                                                    </div>


                                                    <div>

                                                        <div className="fw-semibold text-dark small">

                                                            {lead.name ||
                                                                "Unknown"}

                                                        </div>

                                                        <div
                                                            className="text-secondary"
                                                            style={{
                                                                fontSize: 11
                                                            }}
                                                        >

                                                            {lead.email ||
                                                                "—"}

                                                        </div>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Contact */}

                                            <td>

                                                <div className="small">

                                                    {lead.phone ||
                                                        "—"}

                                                </div>

                                                {lead.contactMethods?.length >
                                                    0 && (

                                                        <div
                                                            className="text-secondary"
                                                            style={{
                                                                fontSize: 10
                                                            }}
                                                        >

                                                            {lead.contactMethods.join(
                                                                ", "
                                                            )}

                                                        </div>

                                                    )}

                                            </td>


                                            {/* Location */}

                                            <td>

                                                <div className="fw-semibold small">

                                                    {lead.suburb ||
                                                        "—"}

                                                </div>

                                                <div
                                                    className="text-secondary"
                                                    style={{
                                                        fontSize: 11
                                                    }}
                                                >

                                                    {lead.state ?? ""}

                                                    {" "}

                                                    {lead.postcode ||
                                                        ""}

                                                </div>

                                            </td>



                                            {/* Services */}

                                            <td>

                                                <div className="d-flex flex-wrap gap-1">

                                                    {getServices(
                                                        lead
                                                    ).map(
                                                        (service) => (

                                                            <span
                                                                key={service}
                                                                className="badge bg-primary bg-opacity-10 text-primary rounded-pill"
                                                                style={{
                                                                    fontSize: 10
                                                                }}
                                                            >

                                                                {service}

                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            </td>


                                            {/* Status */}

                                            <td>

                                                {lead.status === 0 ? (
                                                <span className="badge bg-warning">
                                                    New
                                                </span>
                                            ) : lead.status === 1 ? (
                                                <span className="badge bg-success">
                                                    Quoted
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary">
                                                    Unknown
                                                </span>
                                            )}


                                                {lead.quoteId && (

                                                    <div
                                                        className="text-success mt-1"
                                                        style={{
                                                            fontSize: 10
                                                        }}
                                                    >

                                                        Quote #
                                                        {lead.quoteId}

                                                    </div>

                                                )}

                                            </td>


                                            {/* Date */}

                                            <td>
                                                <span className="text-secondary small">
                                                    {lead.createdAt
                                                        ? new Date(lead.createdAt).toISOString().split("T")[0]
                                                        : "—"}
                                                </span>
                                            </td>


                                            {/* Action */}

                                            <td className="text-center">

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary rounded-5 px-3"
                                                    onClick={() =>
                                                        setSelectedLead(
                                                            lead
                                                        )
                                                    }
                                                >

                                                    View

                                                </button>
                                               <button type="button"  className="btn btn-sm btn-outline-primary rounded-5 px-3" title="Add Leads"   
                                                disabled={
                                                lead.status === 1
                                                }
                                                   onClick={() => { redirect(`/dashboard/quote/create/${lead.id}`) }}
                                                >
                                                    +Leads

                                                </button>

                                                 


                                            </td>

                                        </tr>

                                    )

                                )

                            )}

                        </tbody>

                    </table>

                </div>


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {totalPages > 1 && (

                    <div className="card-footer bg-white border-top px-4 py-3">

                        <div className="d-flex justify-content-between align-items-center">

                            <div className="text-secondary small">

                                Showing{" "}

                                {(currentPage - 1) *
                                    perPage +
                                    1}

                                {" - "}

                                {Math.min(
                                    currentPage *
                                    perPage,
                                    filteredLeads.length
                                )}

                                {" of "}

                                {filteredLeads.length}

                            </div>


                            <div className="d-flex gap-1">

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary rounded-3"
                                    disabled={
                                        currentPage === 1
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                page - 1
                                        )
                                    }
                                >

                                    ←

                                </button>


                                {Array.from(
                                    {
                                        length: totalPages
                                    },
                                    (_, index) =>
                                        index + 1
                                ).map((page) => (

                                    <button
                                        type="button"
                                        key={page}
                                        className={`btn btn-sm rounded-3 ${currentPage === page
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                            }`}
                                        onClick={() =>
                                            setCurrentPage(
                                                page
                                            )
                                        }
                                    >

                                        {page}

                                    </button>

                                ))}


                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary rounded-3"
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                page + 1
                                        )
                                    }
                                >

                                    →

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </>
    );
}