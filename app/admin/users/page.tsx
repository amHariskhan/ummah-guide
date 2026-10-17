import Link from "next/link";
import Form from "next/form";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/admin/AdminHeader";

const ROLES = ["all", "user", "scholar", "admin"] as const;
type RoleTab = (typeof ROLES)[number];

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_blocked: boolean;
  created_at: string;
  last_sign_in_at: string | null;
};

// e.g. "14 Oct 2026"
function shortDate(date: string | null) {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const roleBadge: Record<string, string> = {
  admin: "bg-amber-100 text-amber-700",
  scholar: "bg-emerald-100 text-emerald-700",
  user: "bg-gray-100 text-gray-700",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await connection();
  const supabase = await createClient();

  // 1. Only admins allowed
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect("/");

  // 2. Read search + filter from the URL (?q=ali&role=scholar)
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const activeRole: RoleTab = ROLES.includes(params.role as RoleTab)
    ? (params.role as RoleTab)
    : "all";

  // 3. Call our secure database function
  const { data, error } = await supabase.rpc("admin_list_users");
  const allUsers = (data ?? []) as UserRow[];

  // 4. Counts for the tabs
  const counts: Record<RoleTab, number> = {
    all: allUsers.length,
    user: allUsers.filter((u) => u.role === "user").length,
    scholar: allUsers.filter((u) => u.role === "scholar").length,
    admin: allUsers.filter((u) => u.role === "admin").length,
  };

  // 5. Apply role filter + search
  const search = q.toLowerCase();
  const users = allUsers.filter((u) => {
    const roleOk = activeRole === "all" || u.role === activeRole;
    const searchOk =
      !search ||
      (u.full_name ?? "").toLowerCase().includes(search) ||
      (u.email ?? "").toLowerCase().includes(search);
    return roleOk && searchOk;
  });

  return (
    <>
      <AdminHeader
        title="Users"
        subtitle={`${counts.all} registered account${counts.all === 1 ? "" : "s"}`}
      />

      <div className="space-y-4 p-6 md:p-8">
        {/* Toolbar: tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {ROLES.map((r) => (
              <Link
                key={r}
                href={`/admin/users?role=${r}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                  activeRole === r ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {r}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    activeRole === r ? "bg-white/20" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {counts[r]}
                </span>
              </Link>
            ))}
          </div>

          <Form action="/admin/users" className="relative w-full sm:w-72">
            <input type="hidden" name="role" value={activeRole} />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name or email..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </Form>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Could not load users: {error.message}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="hidden grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 md:grid">
            <div className="col-span-5">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Joined / Last login</div>
          </div>

          {users.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500">No users found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-12 md:items-center md:gap-4"
                >
                  {/* Name + email */}
                  <div className="flex min-w-0 items-center gap-3 md:col-span-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {(u.full_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {u.full_name ?? "No name"}
                        {u.id === user.id && (
                          <span className="ml-2 text-xs font-normal text-gray-400">(you)</span>
                        )}
                      </p>
                      <p className="truncate text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="md:col-span-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        roleBadge[u.role] ?? roleBadge.user
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    {u.is_blocked ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-red-600">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="text-sm text-gray-600 md:col-span-3">
                    <p>{shortDate(u.created_at)}</p>
                    <p className="text-xs text-gray-400">Last login: {shortDate(u.last_sign_in_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}