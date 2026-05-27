export const roleLabels = {
  admin: "Admin",
  warehouse_manager: "Manajer Gudang",
  staff: "Staf Gudang",
  viewer: "Viewer",
};

export const typeLabels = {
  stock_in: "Stok Masuk",
  stock_out: "Stok Keluar",
};

export const deniedMessage = "Akses ditolak. Role Anda tidak memiliki izin untuk fitur ini.";

export const displayRole = (role) => roleLabels[role] || role || "User";

export const displayStockType = (type) => typeLabels[type] || type || "-";

export const canManageMasterData = (role) =>
  ["admin", "warehouse_manager"].includes(role);

export const canUseStockTransactions = (role) =>
  ["admin", "warehouse_manager", "staff"].includes(role);

export const canViewAuditLogs = (role) =>
  ["admin", "warehouse_manager"].includes(role);

export const canViewReports = (role) =>
  ["admin", "warehouse_manager", "staff", "viewer"].includes(role);
