import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, useSortBy } from 'react-table';
import './App.css';

function CryptoTable({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setSortBy
  } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );
  const handleSortChange = (e) => {
    const [selectedColumn, sortOrder] = e.target.value.split(',');
    const column = columns.find((col) => col.accessor === selectedColumn);
    if (column) {
      setSortBy([{ id: column.accessor, desc: sortOrder === 'desc' }]);
    }
  };  

  return (
    <div>
      <div className="sorting-controls">
        <label htmlFor="sortSelect">Sort By:</label>
        <select id="sortSelect" onChange={handleSortChange}>
          <option value="">Sort By:</option>
          {columns.map((column) => (
            <optgroup key={column.Header} label={column.Header}>
              <option value={`${column.accessor},asc`}>{column.Header} (Ascending)</option>
              <option value={`${column.accessor},desc`}>{column.Header} (Descending)</option>
            </optgroup>
          ))}
        </select>
      </div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()} data-label={cell.column.Header}>{cell.render('Cell')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [cryptoData, setCryptoData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const assetsResponse = await axios.get('https://api.coincap.io/v2/assets');
      const assetsData = assetsResponse.data.data.slice(0, 25);

      const exchangeResponse = await axios.get('https://open.er-api.com/v6/latest/USD');
      const exchangeRates = exchangeResponse.data.rates;

      const updatedCryptoData = assetsData.map(asset => {
        const { id, rank, symbol, name, priceUsd } = asset;
        return {
          id,
          rank,
          symbol,
          name,
          priceUsd,
          priceGbp: (priceUsd * exchangeRates.GBP),
          priceEur: (priceUsd * exchangeRates.EUR),
          priceAed: (priceUsd * exchangeRates.AED)
        };
      });

      setCryptoData(updatedCryptoData);
    };

    fetchData();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id'
      },
      {
        Header: 'Rank',
        accessor: 'rank'
      },
      {
        Header: 'Symbol',
        accessor: 'symbol'
      },
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'USD Price',
        accessor: 'priceUsd'
      },
      {
        Header: 'GBP Price',
        accessor: 'priceGbp'
      },
      {
        Header: 'EUR Price',
        accessor: 'priceEur'
      },
      {
        Header: 'AED Price',
        accessor: 'priceAed'
      }
    ],
    []
  );

  return (
    <div className="App">
      <h1>Crypto Currency Table</h1>
      <CryptoTable columns={columns} data={cryptoData} />
    </div>
  );
}

export default App;