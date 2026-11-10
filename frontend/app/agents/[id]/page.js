"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { agentsApi } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Skeleton from "@/components/Skeleton";
import ProtectedRoute from "@/components/ProtectedRoute";

function AgentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setAgent(await agentsApi.get(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const remove = async () => {
    if (!confirm("Delete this agent?")) return;
    try {
      await agentsApi.remove(id);
      router.push("/");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Skeleton rows={7} />;
  if (error) return <div className="alert error">{error}</div>;
  if (!agent) return null;

  return (
    <div>
      <div className="row-between">
        <h2>{agent.full_name}</h2>
        {user && (
          <div className="actions">
            <Link href={`/agents/${agent.id}/edit`} className="btn">
              Edit
            </Link>
            <button className="btn danger" onClick={remove}>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="detail-content">
        <div className="detail-row">
          <div className="k">ID</div>
          <div className="v">{agent.id}</div>
        </div>
        <div className="detail-row">
          <div className="k">Phone</div>
          <div className="v">+91 {agent.phone}</div>
        </div>
        <div className="detail-row">
          <div className="k">Email</div>
          <div className="v">{agent.email}</div>
        </div>
        <div className="detail-row">
          <div className="k">Service area</div>
          <div className="v">{agent.service_area}</div>
        </div>
        <div className="detail-row">
          <div className="k">Status</div>
          <div className="v">
            <span className={`badge ${agent.status}`}>{agent.status}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="k">Created</div>
          <div className="v">{new Date(agent.created_at).toLocaleString()}</div>
        </div>
        <div className="detail-row">
          <div className="k">Updated</div>
          <div className="v">{new Date(agent.updated_at).toLocaleString()}</div>
        </div>
        </div>
      </div>

      <p style={{ marginTop: 16 }}>
        <Link href="/">← Back to list</Link>
      </p>
    </div>
  );
}

export default function AgentDetailPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Skeleton rows={7} />}>
        <AgentDetail />
      </Suspense>
    </ProtectedRoute>
  );
}
