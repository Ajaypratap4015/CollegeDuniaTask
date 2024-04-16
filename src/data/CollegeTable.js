import React, { useState, useEffect, useRef } from 'react';
import { useTable, useSortBy, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table';
import { collegesData } from './collegesData'; // Import the college data
import './CollegeTable.css'; // Import the CSS file

const CollegeTable = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    // Initially load 10 rows
    setData(collegesData.slice(0, 10));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isFetching) {
          setIsFetching(true);
          setTimeout(() => {
            // Simulating fetching more data after 1 second delay
            const newData = collegesData.slice(data.length, data.length + 5); // Fetch only 5 colleges
            setData((prevData) => [...prevData, ...newData]);
            setIsFetching(false);
          }, 1000);
        }
      },
      { threshold: 0.5 }
    );

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    return () => {
      if (tableRef.current) {
        observer.unobserve(tableRef.current);
      }
    };
  }, [data, isFetching]);

  const getRankSuffix = (num) => {
    const lastDigit = num % 10;
    if (num === 11 || num === 12 || num === 13) {
      return 'th';
    } else if (lastDigit === 1) {
      return 'st';
    } else if (lastDigit === 2) {
      return 'nd';
    } else if (lastDigit === 3) {
      return 'rd';
    } else {
      return 'th';
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'CD Rank',
        accessor: 'rank',
        Cell: ({ value }) => `#${value}`, // Prepend a hash symbol to the rank value
      },
      {
        Header: 'College',
        accessor: 'collegeName',
        Cell: ({ row }) => (
          <div className="college-info">
      {row.original.featured && <span className="featured-banner" ><span className="featured">Featured</span></span>} {/* Display the Featured flag */}
      <div className="college-name">{row.original.collegeName}</div>
      <div className="course-info">{row.original.courseInfo.name}</div>
    </div>
        ),
      },
      {
        Header: 'Course Fees',
        accessor: 'courseInfo.fees',
        Cell: ({ value }) => <span className="course-fees"><b>{`${value.toFixed(2)} Lakhs`}</b></span>,
      },
      {
        Header: 'Placement',
        accessor: 'placement',
        Cell: ({ value }) => <span className="placement"><b>{`${value.averageSalary.toFixed(2)} Lakhs (${value.topRecruiter})`}</b></span>,
      },
      {
        Header: 'User Reviews',
        accessor: 'userReviews',
        Cell: ({ value }) => (
          <span>
            <span role="img" aria-label="Star" style={{ color: 'yellow' }}>⭐</span>
            {`${value.rating}/10`} <span style={{ fontSize: 'small' }}>(based on{value.reviewCount} users)</span>
          </span>
        ),
      },
      {
        Header: 'Ranking',
        accessor: 'ranking',
        Cell: ({ value }) => `#${value.collegedunia}${getRankSuffix(value.collegedunia)}/100 in India`, // Include the suffix for the ranking,
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { sortBy: [{ id: 'rank', desc: false }] },
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  const { globalFilter } = state;

  const handleSearch = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 500);

  return (
    <div className="college-table-container">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value);
        }}
        placeholder="Search colleges"
        className="search-input"
      />
      <table {...getTableProps()} className="college-table" ref={tableRef}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
  {rows.map((row, index) => {
    prepareRow(row);
    return (
      <tr
        {...row.getRowProps()}
        ref={index === rows.length - 1 ? tableRef : null}
        className={row.original.featured ? 'featured-college-row' : ''}
      >
        {row.cells.map((cell) => (
          <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
        ))}
      </tr>
    );
  })}
</tbody>

      </table>
      {isFetching && <div className="loader">Loading...</div>}
    </div>
  );
};

export default CollegeTable;
