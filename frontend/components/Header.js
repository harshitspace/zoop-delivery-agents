"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="site">
      <div className="inner">
        <h1>
          <Link href="/">Delivery Agents</Link>
        </h1>
        <div className="actions">
          {user ? (
            <>
              <Link href="/agents/new" className="btn primary">
                Add Agent
              </Link>
              <button className="btn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
