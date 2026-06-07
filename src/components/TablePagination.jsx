import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const TablePagination = ({ total, page, pageSize, onPageChange, onPageSizeChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-12 mt-16">
      {/* Rows per page */}
      <div className="d-flex align-items-center gap-8">
        <span className="text-secondary-light text-sm">Show</span>
        <select
          className="form-select form-select-sm radius-8"
          style={{ width: 70 }}
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-secondary-light text-sm">entries</span>
      </div>

      {/* Info */}
      <span className="text-secondary-light text-sm">
        Showing <strong>{from}</strong> to <strong>{to}</strong> of <strong>{total}</strong> entries
      </span>

      {/* Page buttons */}
      <ul className="pagination d-flex align-items-center gap-4 mb-0">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button
            className="page-link radius-8 d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32 }}
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <Icon icon="ep:arrow-left" />
          </button>
        </li>

        {getPages().map((p, i) =>
          p === "..." ? (
            <li key={`dots-${i}`} className="page-item disabled">
              <span className="page-link radius-8 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                …
              </span>
            </li>
          ) : (
            <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
              <button
                className="page-link radius-8 d-flex align-items-center justify-content-center"
                style={{ width: 32, height: 32 }}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </li>
          )
        )}

        <li className={`page-item ${page === totalPages || totalPages === 0 ? "disabled" : ""}`}>
          <button
            className="page-link radius-8 d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32 }}
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            <Icon icon="ep:arrow-right" />
          </button>
        </li>
      </ul>
    </div>
  );
};

export default TablePagination;