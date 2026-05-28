import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import Alert from "../components/Alert";
import { getUsers, updateUserRole } from "../api/userApi";
import { deniedMessage, displayRole } from "../utils/roles";

const roles = ["admin", "warehouse_manager", "staff", "viewer"];

export default function RoleAccessPage() {
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.data);
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Data user gagal dimuat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleRoleChange = async (user, role) => {
    try {
      await updateUserRole(user.id, role);
      setNotice(`Role ${user.email} berhasil diubah menjadi ${displayRole(role)}.`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.status === 403 ? deniedMessage : "Role user gagal diperbarui.");
    }
  };

  return (
    <DashboardLayout title="Hak Akses" subtitle="Kelola role user internal" onRefresh={fetchUsers}>
      {error && <Alert message={error} onClose={() => setError("")} />}
      {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}

      <div className="ss-page-head">
        <div>
          <h1>Hak Akses</h1>
          <p>Admin dapat mengubah role akun internal tanpa membuka register public.</p>
        </div>
        <button className="ss-primary" onClick={fetchUsers}>
          <span className="material-symbols-outlined">refresh</span>
          Muat Ulang
        </button>
      </div>

      <section className="ss-card">
        <DataTable
          columns={[
            { key: "name", label: "Nama" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role", render: (row) => displayRole(row.role) },
            {
              key: "change_role",
              label: "Ubah Role",
              render: (row) => (
                <select value={row.role} onChange={(event) => handleRoleChange(row, event.target.value)}>
                  {roles.map((role) => (
                    <option key={role} value={role}>{displayRole(role)}</option>
                  ))}
                </select>
              ),
            },
          ]}
          rows={users}
        />
      </section>
    </DashboardLayout>
  );
}
