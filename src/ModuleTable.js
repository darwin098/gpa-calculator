function ModuleRow(props) {
  return (
    <tr>
      <td>{props.name}</td>
      <td>{props.credit}</td>
      <td>{props.grade}</td>
      <td>
        <button onClick={props.onDelete}>delete</button>
      </td>
    </tr>
  );
}

function ModuleTable(props) {
  return (
    <table id="module-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Credit</th>
          <th>Grade</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {props.rows.map(
          (row, index) =>
            !row.isDeleted && (
              <ModuleRow
                name={row.name}
                credit={row.credit}
                grade={row.grade}
                onDelete={() => props.onDeleteRow(index)}
              ></ModuleRow>
            )
        )}
      </tbody>
    </table>
  );
}

let addRow;
let getRows;

window.addEventListener('DOMContentLoaded', function () {
  const rows = [];

  const root = ReactDOM.createRoot(document.querySelector('#table-root'));

  function deleteRow(index) {
    if (index > rows.length) return;
    rows[index].isDeleted = true;
    renderModuleTable();
  }

  function renderModuleTable() {
    root.render(<ModuleTable rows={rows} onDeleteRow={deleteRow} />);
  }

  addRow = function (name, credit, grade) {
    rows.push({ name, credit, grade });
    renderModuleTable();
  };

  getRows = function () {
    return rows.filter((row) => !row.isDeleted);
  };

  renderModuleTable();
});
