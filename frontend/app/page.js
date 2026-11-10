"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { agentsApi } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Skeleton from "@/components/Skeleton";

const LIMIT = 10;

export default function AgentsListPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await agentsApi.list({ search, status, page, limit: LIMIT });
      setAgents(res.agents);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  const debounce = useRef(null);
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(load, 300);
    return () => clearTimeout(debounce.current);
  }, [load]);

  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onStatus = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const remove = async (id) => {
    if (!confirm("Delete this agent?")) return;
    try {
      await agentsApi.remove(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="row-between">
        <h2>Agents ({pagination.total})</h2>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search name, phone, email, area..."
          value={search}
          onChange={onSearch}
        />
        <select value={status} onChange={onStatus}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <Skeleton rows={6} />
      ) : agents.length === 0 ? (
        <p className="muted">No agents found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Area</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.full_name}</td>
                <td>+91 {a.phone}</td>
                <td>{a.email}</td>
                <td>{a.service_area}</td>
                <td>
                  <span className={`badge ${a.status}`}>{a.status}</span>
                </td>
                <td>
                  <div className="actions">
                    <Link href={`/agents/${a.id}`} className="btn">
                      View
                    </Link>
                    {user && (
                      <>
                        <Link href={`/agents/${a.id}/edit`} className="btn">
                          Edit
                        </Link>
                        <button className="btn danger" onClick={() => remove(a.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="pageinfo">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
