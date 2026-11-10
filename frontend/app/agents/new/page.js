"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { agentsApi } from "@/lib/api";
import AgentForm from "@/components/AgentForm";
import { useAuth } from "@/components/AuthProvider";
import Skeleton from "@/components/Skeleton";

export default function NewAgentPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return <Skeleton rows={6} />;

  const create = async (data) => {
    await agentsApi.create(data);
    router.push("/");
  };

  return (
    <div>
      <div className="row-between">
        <h2>Add Agent</h2>
      </div>
      <div className="card">
        <AgentForm key="new" onSubmit={create} submitLabel="Create Agent" />
      </div>
    </div>
  );
}
