function ModuleRow(props) {
  return React.createElement(
    'tr',
    null,
    React.createElement(
      'td',
      null,
      props.name
    ),
    React.createElement(
      'td',
      null,
      props.credit
    ),
    React.createElement(
      'td',
      null,
      props.grade
    ),
    React.createElement(
      'td',
      null,
      React.createElement(
        'button',
        { onClick: props.onDelete },
        'delete'
      )
    )
  );
}

function ModuleTable(props) {
  return React.createElement(
    'table',
    { id: 'module-table' },
    React.createElement(
      'thead',
      null,
      React.createElement(
        'tr',
        null,
        React.createElement(
          'th',
          null,
          'Name'
        ),
        React.createElement(
          'th',
          null,
          'Credit'
        ),
        React.createElement(
          'th',
          null,
          'Grade'
        ),
        React.createElement(
          'th',
          null,
          'Delete'
        )
      )
    ),
    React.createElement(
      'tbody',
      null,
      props.rows.map(function (row, index) {
        return !row.isDeleted && React.createElement(ModuleRow, {
          name: row.name,
          credit: row.credit,
          grade: row.grade,
          onDelete: function onDelete() {
            return props.onDeleteRow(index);
          }
        });
      })
    )
  );
}

var addRow = void 0;
var getRows = void 0;

window.addEventListener('DOMContentLoaded', function () {
  var rows = [];

  var root = ReactDOM.createRoot(document.querySelector('#table-root'));

  function deleteRow(index) {
    if (index > rows.length) return;
    rows[index].isDeleted = true;
    renderModuleTable();
  }

  function renderModuleTable() {
    root.render(React.createElement(ModuleTable, { rows: rows, onDeleteRow: deleteRow }));
  }

  addRow = function addRow(name, credit, grade) {
    rows.push({ name: name, credit: credit, grade: grade });
    renderModuleTable();
  };

  getRows = function getRows() {
    return rows.filter(function (row) {
      return !row.isDeleted;
    });
  };

  renderModuleTable();
});