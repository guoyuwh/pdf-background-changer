// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Create a temp folder if it doesn't exist
const tempDir = path.join(process.cwd(), 'temp');

export async function POST(request: NextRequest) {
  try {
    // Ensure the temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // Get the content-type header to check for multipart/form-data
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content-type header' }, { status: 400 });
    }

    // Get the boundary string
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return NextResponse.json({ error: 'No boundary found in content-type header' }, { status: 400 });
    }

    // Read the request body as a buffer
    const buffer = await request.arrayBuffer();
    const data = Buffer.from(buffer);

    // Parse the multipart/form-data
    const parts = parseMultipartFormData(data, boundary);

    // Find the PDF file
    const filePart = parts.find(
      (part) => part.type === 'file' && part.filename && part.contentType === 'application/pdf'
    );

    if (!filePart) {
      return NextResponse.json({ error: 'No PDF file found in the form data' }, { status: 400 });
    }

    // Save the file
    const timestamp = Date.now();
    const filePath = path.join(tempDir, `${timestamp}-${filePart.filename}`);
    await fs.writeFile(filePath, filePart.data);

    return NextResponse.json({ message: 'File uploaded successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to parse multipart/form-data
function parseMultipartFormData(data: Buffer, boundary: string) {
  const parts: Array<{
    headers: { [key: string]: string };
    data: Buffer;
    name?: string;
    filename?: string;
    contentType?: string;
    type: 'field' | 'file';
  }> = [];

  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const boundaryLength = boundaryBuffer.length;
  let start = data.indexOf(boundaryBuffer) + boundaryLength + 2; // Skip initial boundary

  while (start < data.length) {
    const end = data.indexOf(boundaryBuffer, start);
    if (end === -1) break;

    const headersEnd = data.indexOf('\r\n\r\n', start);
    const headersRaw = data.slice(start, headersEnd).toString();
    const headers = parseHeaders(headersRaw);

    const contentStart = headersEnd + 4; // Skip the '\r\n\r\n'
    const contentEnd = end - 2; // Skip the '\r\n' before the boundary

    const content = data.slice(contentStart, contentEnd);

    const disposition = headers['content-disposition'] || '';
    const nameMatch = disposition.match(/name="([^"]+)"/);
    const filenameMatch = disposition.match(/filename="([^"]+)"/);

    const part = {
      headers,
      data: content,
      name: nameMatch ? nameMatch[1] : undefined,
      filename: filenameMatch ? filenameMatch[1] : undefined,
      contentType: headers['content-type'],
      type: filenameMatch ? 'file' : 'field' as 'field' | 'file',
    };

    parts.push(part);
    start = end + boundaryLength + 2; // Move to the next part
  }

  return parts;
}

// Helper function to parse headers in each part
function parseHeaders(headerString: string) {
  const headers: { [key: string]: string } = {};
  const lines = headerString.split('\r\n');
  for (const line of lines) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    const key = line.slice(0, index).trim().toLowerCase();
    const value = line.slice(index + 1).trim();
    headers[key] = value;
  }
  return headers;
}
