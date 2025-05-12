import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Read the EO_Timelines_v2.csv file
    const filePath = path.join(process.cwd(), 'data', 'EO_Timelines_v2.csv');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse the CSV data with more relaxed options
    const records = parse(fileContents, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true
    });
    
    // Clean up the data
    const cleanedRecords = records.map(record => {
      // Create a new clean record
      const cleaned = {};
      
      // Copy over properties, filtering out empty strings and undefined values
      Object.keys(record).forEach(key => {
        if (key && key.trim() !== '') {
          const value = record[key];
          if (value !== undefined && value !== '') {
            cleaned[key.trim()] = value;
          }
        }
      });
      
      return cleaned;
    });
    
    // Return the data as JSON
    return NextResponse.json(cleanedRecords);
  } catch (error) {
    console.error('Error reading or parsing CSV:', error);
    return NextResponse.json(
      { error: 'Failed to load timeline data' },
      { status: 500 }
    );
  }
}