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
    state,
    setSortBy
  } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );
  const handleSortChange = (e) => {
    const selectedColumn = e.target.value;
    const column = columns.find((col) => col.Header === selectedColumn);
    if (column) {
      setSortBy([{ id: column.accessor, desc: state.sortBy[0]?.desc || false }]);
    }
  };

  return (
    <div>
      <div className="sorting-controls">
        <label htmlFor="sortSelect">Sort By:</label>
        <select id="sortSelect" onChange={handleSortChange}>
          {columns.map((column) => (
            <option key={column.Header}>{column.Header}</option>
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
          priceGbp: (priceUsd * exchangeRates.GBP).toFixed(2),
          priceEur: (priceUsd * exchangeRates.EUR).toFixed(2),
          priceAed: (priceUsd * exchangeRates.AED).toFixed(2)
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