const Table = ({ headers, children }) => (
  <div className='overflow-x-auto rounded-lg border border-border'>
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-border bg-slate-50 text-left'>
          {headers.map((h) => (
            <th key={h} className='whitespace-nowrap px-4 py-3 font-semibold text-text-heading'>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className='divide-y divide-border'>{children}</tbody>
    </table>
  </div>
);

export default Table;
