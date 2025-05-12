import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export default async function Page({ params }) {
  const { id } = params;
  
  // Read the EO_Agency_Classification.csv file
  const agencyFilePath = path.join(process.cwd(), 'data', 'EO_Agency_Classification.csv');
  const agencyFileContents = fs.readFileSync(agencyFilePath, 'utf8');
  
  // Parse the CSV data
  const agencyRecords = parse(agencyFileContents, {
    columns: true,
    skip_empty_lines: true
  });
  
  // Read the EO_Timelines_v2.csv file which has the document_number_bridge field
  const timelinesFilePath = path.join(process.cwd(), 'data', 'EO_Timelines_v2.csv');
  const timelinesFileContents = fs.readFileSync(timelinesFilePath, 'utf8');
  
  // Parse the Timelines CSV data with relaxed parsing to handle inconsistent columns
  const timelinesRecords = parse(timelinesFileContents, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true, // Allow records with varying column counts
    trim: true // Trim whitespace from values
  });
  
  // Get timeline matches using the document_number_bridge field to match with the slug id
  const timelineMatches = timelinesRecords.filter(record => 
    record.document_number_bridge && record.document_number_bridge.trim() === id
  );
  
  // Log the timeline matches to the console
  console.log(`Timeline matches for document_number ${id}:`, timelineMatches);
  console.log('Number of timeline matches:', timelineMatches.length);
  
  // Find the record with the matching document_number from agency classification
  const eoData = agencyRecords.find(record => record.document_number.trim() === id);
  
  // If no matching record is found
  if (!eoData) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Executive Order Not Found</h1>
        <p>No executive order found with document number: {id}</p>
        <a href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Home
        </a>
      </div>
    );
  }
  
  // Parse agencies and categories from string representation
  const agencies = eoData.agencies.replace(/[\[\]']/g, '').split(',').map(agency => agency.trim()).filter(Boolean);
  const categories = eoData.categories.replace(/[\[\]']/g, '').split(',').map(category => category.trim()).filter(Boolean);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{eoData.title}</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Document Number</h2>
        <p>{eoData.document_number}</p>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {category}
              </span>
            ))
          ) : (
            <p>No categories listed</p>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Agencies</h2>
        <div className="flex flex-wrap gap-2">
          {agencies.length > 0 ? (
            agencies.map((agency, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {agency}
              </span>
            ))
          ) : (
            <p>No agencies listed</p>
          )}
        </div>
      </div>
      
      {timelineMatches.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Implementation Timeline</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4">Agency</th>
                  <th className="text-left py-2 px-4">Action</th>
                  <th className="text-left py-2 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {timelineMatches.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2 px-4">{item.agency}</td>
                    <td className="py-2 px-4">{item.action}</td>
                    <td className="py-2 px-4">
                      {item.due_date === "Immediate" ? (
                        <span className="text-red-600 font-medium">Immediate</span>
                      ) : (
                        item.due_date
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Federal Register Link</h2>
        <a 
          href={eoData.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View on Federal Register
        </a>
      </div>
      
      <a href="/" className="text-blue-500 hover:underline mt-4 inline-block">
        Return to Home
      </a>
    </div>
  );
}