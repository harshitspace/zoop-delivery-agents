"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { agentsApi } from "@/lib/api";
import AgentForm from "@/components/AgentForm";
import { useAuth } from "@/components/AuthProvider";
import Skeleton from "@/components/Skeleton";

function EditAgent() {
  const { id } = useParams();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    (async () => {
      try {
        const a = await agentsApi.get(id);
        setAgent({
          full_name: a.full_name,
          phone: a.phone,
          email: a.email,
          service_area: a.service_area,
          status: a.status,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const update = async (data) => {
    await agentsApi.update(id, data);
    router.push(`/agents/${id}`);
  };

  if (!ready || !user) return <Skeleton rows={6} />;
  if (loading) return <Skeleton rows={6} />;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div>
      <div className="row-between">
        <h2>Edit Agent</h2>
      </div>
      <div className="card">
        <AgentForm key={`edit-${id}`} onSubmit={update} initial={agent} submitLabel="Save Changes" />
      </div>
    </div>
  );
}

export default function EditAgentPage() {
  return (
    <Suspense fallback={<Skeleton rows={6} />}>
      <EditAgent />
    </Suspense>
  );
}
