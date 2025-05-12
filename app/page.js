'use client';

// Client-side imports only
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

// This component now uses client-side data fetching

export default function Home() {
  // For client-side filtering and pagination
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [agencies, setAgencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const recordsPerPage = 12;
  
  // Fetch data on client side
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/eo-data');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        // Sort by document number in descending order (newest first)
        const sortedRecords = data.sort((a, b) => {
          return b.document_number.localeCompare(a.document_number);
        });
        
        setRecords(sortedRecords);
        setFilteredRecords(sortedRecords);
        
        // Extract unique agencies and categories
        const agencySet = new Set();
        const categorySet = new Set();
        
        sortedRecords.forEach(record => {
          // Handle agencies
          const recordAgencies = record.agencies.replace(/[\[\]']/g, '').split(',')
            .map(agency => agency.trim())
            .filter(Boolean);
          
          recordAgencies.forEach(agency => agencySet.add(agency));
          
          // Handle categories
          const recordCategories = record.categories.replace(/[\[\]']/g, '').split(',')
            .map(category => category.trim())
            .filter(Boolean);
          
          recordCategories.forEach(category => categorySet.add(category));
        });
        
        setAgencies(Array.from(agencySet).sort());
        setCategories(Array.from(categorySet).sort());
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filter records when filters change
  useEffect(() => {
    let filtered = [...records];
    
    // Apply agency filter
    if (selectedAgency) {
      filtered = filtered.filter(record => {
        const recordAgencies = record.agencies.replace(/[\[\]']/g, '').split(',')
          .map(agency => agency.trim())
          .filter(Boolean);
        
        return recordAgencies.includes(selectedAgency);
      });
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(record => {
        const recordCategories = record.categories.replace(/[\[\]']/g, '').split(',')
          .map(category => category.trim())
          .filter(Boolean);
        
        return recordCategories.includes(selectedCategory);
      });
    }
    
    // Apply text search filter
    if (searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(record => {
        return (
          record.title.toLowerCase().includes(searchLower) || 
          record.document_number.toLowerCase().includes(searchLower) ||
          // Also search in agencies
          record.agencies.toLowerCase().includes(searchLower) ||
          // Also search in categories 
          record.categories.toLowerCase().includes(searchLower)
        );
      });
    }
    
    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedAgency, selectedCategory, searchText, records]);
  
  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle filter changes
  const handleAgencyChange = (e) => {
    setSelectedAgency(e.target.value);
  };
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };
  
  const clearFilters = () => {
    setSelectedAgency('');
    setSelectedCategory('');
    setSearchText('');
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-8 sm:p-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Executive Orders Database</h1>
        <p className="text-gray-600">Browse and explore executive orders by document number, agencies, and categories</p>
      </header>

      {loading ? (
        <div className="text-center py-8">Loading executive orders...</div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold mb-4">Filter Executive Orders</h2>
            
            {/* Search input */}
            <div className="mb-4">
              <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search-filter"
                  placeholder="Search by title, document number, agency, or category..."
                  className="w-full p-2 pr-10 border border-gray-300 rounded"
                  value={searchText}
                  onChange={handleSearchChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="agency-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  By Agency
                </label>
                <select
                  id="agency-filter"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={selectedAgency}
                  onChange={handleAgencyChange}
                >
                  <option value="">All Agencies</option>
                  {agencies.map((agency, i) => (
                    <option key={i} value={agency}>
                      {agency}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  By Category
                </label>
                <select
                  id="category-filter"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, i) => (
                    <option key={i} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded border border-gray-300 hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
              
              <div className="flex items-end justify-end">
                <p className="text-sm text-gray-500">
                  Showing {filteredRecords.length} of {records.length} executive orders
                </p>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <main>
            <h2 className="text-xl font-semibold mb-4">
              {selectedAgency || selectedCategory || searchText ? 'Filtered Results' : 'Recent Executive Orders'}
            </h2>
            
            {currentRecords.length === 0 ? (
              <div className="text-center py-8 border border-gray-200 rounded-lg">
                <p className="text-gray-500">No executive orders match the selected filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Clear filters and show all
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentRecords.map((record) => (
                  <div 
                    key={record.document_number} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{record.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Document #: {record.document_number}</p>
                    
                    <div className="mb-3">
                      <h4 className="text-xs text-gray-600 uppercase tracking-wider">Categories</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {record.categories.replace(/[\[\]']/g, '').split(',')
                          .map(cat => cat.trim())
                          .filter(Boolean)
                          .map((category, i) => (
                            <span 
                              key={i} 
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                            >
                              {category}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                    
                    <Link 
                      href={`/id/${record.document_number}`}
                      className="text-blue-600 hover:underline text-sm inline-block mt-2"
                    >
                      View details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {filteredRecords.length > recordsPerPage && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center">
                  <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l border ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(num => 
                        num === 1 || 
                        num === totalPages || 
                        (num >= currentPage - 1 && num <= currentPage + 1)
                      )
                      .map((number, index, array) => {
                        // Add ellipsis where there are gaps in the sequence
                        if (index > 0 && number - array[index - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${number}`}>
                              <span className="px-3 py-1 border-t border-b bg-gray-50 text-gray-500">...</span>
                              <button
                                onClick={() => paginate(number)}
                                className={`px-3 py-1 border ${
                                  currentPage === number ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                {number}
                              </button>
                            </React.Fragment>
                          );
                        }
                        
                        return (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 border-t border-b border-r ${
                              currentPage === number ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {number}
                          </button>
                        );
                      })}
                  </div>
                  
                  <button
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-r border ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </main>
        </>
      )}
      
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>Executive Orders Data Explorer</p>
      </footer>
    </div>
  );
}