'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AgencyPage({ params }) {
  const { agency } = params;
  const decodedAgency = decodeURIComponent(agency);
  
  const [agencyData, setAgencyData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch EO_Agency_Classification data
        const eoResponse = await fetch('/api/eo-data');
        if (!eoResponse.ok) throw new Error('Failed to fetch EO data');
        const eoData = await eoResponse.json();
        
        // Filter records for this agency
        const filteredEOData = eoData.filter(record => {
          const recordAgencies = record.agencies.replace(/[\[\]']/g, '').split(',')
            .map(agency => agency.trim())
            .filter(Boolean);
          
          return recordAgencies.includes(decodedAgency);
        });
        
        setAgencyData(filteredEOData);
        
        // Fetch timeline data (with actions and due dates)
        const timelineResponse = await fetch('/api/eo-data/timelines');
        if (!timelineResponse.ok) throw new Error('Failed to fetch timeline data');
        const timelineData = await timelineResponse.json();
        
        // Filter timeline items for this agency
        const filteredTimelineData = timelineData.filter(item => 
          item.agency === decodedAgency
        );
        
        // Sort by due date (Immediate first, then others)
        filteredTimelineData.sort((a, b) => {
          if (a.due_date === 'Immediate' && b.due_date !== 'Immediate') return -1;
          if (a.due_date !== 'Immediate' && b.due_date === 'Immediate') return 1;
          return 0;
        });
        
        setTimelineData(filteredTimelineData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, [decodedAgency]);

  return (
    <div className="min-h-screen p-8 sm:p-16">
      <header className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          Back to all Executive Orders
        </Link>
        <h1 className="text-3xl font-bold mb-2">{decodedAgency}</h1>
        <p className="text-gray-600">Executive Orders and required actions for this agency</p>
      </header>

      {loading ? (
        <div className="text-center py-8">Loading agency data...</div>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Executive Orders Involving {decodedAgency}</h2>
            
            {agencyData.length === 0 ? (
              <p className="text-gray-500">No executive orders found for this agency.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Document #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Categories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agencyData.map((record) => (
                      <tr key={record.document_number} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          <Link href={`/id/${record.document_number}`}>
                            {record.document_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.title || 'Untitled'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {record.categories && record.categories.replace(/[\[\]']/g, '').split(',')
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            href={`/id/${record.document_number}`}
                            className="text-blue-600 hover:underline"
                          >
                            View details
                          </Link>
                          {record.html_url && (
                            <a 
                              href={record.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-4 text-blue-600 hover:underline"
                            >
                              Federal Register
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Required Actions for {decodedAgency}</h2>
            
            {timelineData.length === 0 ? (
              <p className="text-gray-500">No actions found for this agency.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Executive Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Action Required
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {timelineData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          <Link href={`/id/${item.document_number_bridge || item.document_number || ''}`}>
                            {item.document_number || 'Unknown'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.action || 'No action specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.due_date === 'Immediate' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Immediate
                            </span>
                          ) : (
                            item.due_date || 'No date specified'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
      
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>Executive Orders Data Explorer</p>
      </footer>
    </div>
  );
}