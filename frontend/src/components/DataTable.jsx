export default function DataTable({ columns, rows, emptyText = "Data belum tersedia" }) {
  return (
    <div className="ss-table-wrap">
      <table className="ss-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="ss-empty" colSpan={columns.length}>{emptyText}</td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr key={row.id || index} className={row.className || ""}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
