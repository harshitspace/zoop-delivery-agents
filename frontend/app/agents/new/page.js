"use client";

import { useRouter } from "next/navigation";
import { agentsApi } from "@/lib/api";
import AgentForm from "@/components/AgentForm";
import ProtectedRoute from "@/components/ProtectedRoute";

function NewAgent() {
  const router = useRouter();

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

export default function NewAgentPage() {
  return (
    <ProtectedRoute>
      <NewAgent />
    </ProtectedRoute>
  );
}
