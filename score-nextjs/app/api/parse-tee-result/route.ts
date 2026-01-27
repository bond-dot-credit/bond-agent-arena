import { NextRequest, NextResponse } from 'next/server';
import { IExec, utils } from 'iexec';
import AdmZip from 'adm-zip';

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    console.log('Parsing TEE result for task:', taskId);

    // Initialize iExec SDK
    const ethProvider = utils.getSignerFromPrivateKey(
      'https://bellecour.iex.ec',
      process.env.WALLET_PRIVATE_KEY || ''
    );
    const iexec = new IExec({ ethProvider });

    // 1. Get task details
    const taskDetails = await iexec.task.show(taskId);

    // 2. Check if completed
    if (taskDetails.status !== 3) {
      return NextResponse.json({
        error: 'Task not completed',
        status: getStatusString(taskDetails.status)
      }, { status: 400 });
    }

    // 3. Fetch result zip from IPFS
    console.log('Fetching results from IPFS...');
    const resultResponse = await iexec.task.fetchResults(taskId);
    console.log('Result type:', typeof resultResponse);

    // Convert Response to ArrayBuffer then Buffer
    const arrayBuffer = await resultResponse.arrayBuffer();
    const resultZipBuffer = Buffer.from(arrayBuffer);
    console.log('Result buffer length:', resultZipBuffer.length);

    // 4. Unzip the result
    const zip = new AdmZip(resultZipBuffer);
    const zipEntries = zip.getEntries();

    console.log('Zip entries:', zipEntries.map(e => e.entryName));

    // 5. Look for result files (common names: result.txt, result.json, computed.json, iexec_out/*)
    let resultData = null;
    let resultFile = null;

    // Try common file patterns
    const possibleFiles = [
      'result.json',
      'result.txt',
      'computed.json',
      'output.json',
      'iexec_out/result.json',
      'iexec_out/computed.json'
    ];

    for (const fileName of possibleFiles) {
      const entry = zipEntries.find(e => e.entryName === fileName || e.entryName.endsWith(fileName));
      if (entry) {
        resultFile = entry.entryName;
        const content = entry.getData().toString('utf8');
        console.log(`Found result file: ${resultFile}`);
        console.log('Content:', content);

        // Try to parse as JSON
        try {
          resultData = JSON.parse(content);
          break;
        } catch {
          // If not JSON, treat as plain text
          resultData = { raw: content };
          break;
        }
      }
    }

    // If no specific file found, check if there's only one file
    if (!resultData && zipEntries.length === 1) {
      resultFile = zipEntries[0].entryName;
      const content = zipEntries[0].getData().toString('utf8');
      console.log('Using single file:', resultFile);
      console.log('Content:', content);

      try {
        resultData = JSON.parse(content);
      } catch {
        resultData = { raw: content };
      }
    }

    if (!resultData) {
      return NextResponse.json({
        error: 'Could not parse result',
        files: zipEntries.map(e => e.entryName)
      }, { status: 500 });
    }

    // 6. Extract score
    // Look for common score field names
    const score = extractScore(resultData);

    if (score === null) {
      console.error('Could not extract score from result:', resultData);
      return NextResponse.json({
        error: 'Score not found in result',
        resultData,
        hint: 'Expected fields: final_score, score, result, value'
      }, { status: 400 });
    }

    // 7. Get IPFS hash
    const ipfsHash = extractIPFSHash(taskDetails.results);

    return NextResponse.json({
      success: true,
      taskId,
      dealId: taskDetails.dealid,
      score: Math.round(score), // Round to integer for blockchain (0-100)
      rawScore: score,
      ipfsHash,
      resultFile,
      resultData,
      teeProof: {
        taskId,
        dealId: taskDetails.dealid,
        workerpool: (taskDetails as any).workerpool,
        status: taskDetails.statusName
      }
    });

  } catch (error: any) {
    console.error('Error parsing TEE result:', error);
    return NextResponse.json(
      { error: 'Failed to parse TEE result', details: error.message },
      { status: 500 }
    );
  }
}

// Helper: Extract score from various formats
function extractScore(data: any): number | null {
  // Try common field names
  const scoreFields = [
    'final_score',
    'score',
    'result',
    'value',
    'gizaScore',
    'creditScore',
    'overallScore'
  ];

  for (const field of scoreFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const value = parseFloat(data[field]);
      if (!isNaN(value)) {
        return value;
      }
    }
  }

  // If data has nested 'score' object
  if (data.score && typeof data.score === 'object') {
    if (data.score.overall !== undefined) return parseFloat(data.score.overall);
    if (data.score.final !== undefined) return parseFloat(data.score.final);
  }

  // If data has 'data' wrapper
  if (data.data) {
    return extractScore(data.data);
  }

  return null;
}

// Helper: Extract IPFS hash
function extractIPFSHash(results: any): string | null {
  if (typeof results === 'string') {
    return results;
  }

  if (typeof results === 'object' && results !== null) {
    if (results.location) return String(results.location);
    if (results.storage) return String(results.storage);
    if (results.ipfs) return String(results.ipfs);
    if (results.hash) return String(results.hash);
  }

  return null;
}

// Helper: Status string
function getStatusString(status: number): string {
  const statusMap: Record<number, string> = {
    0: 'UNSET',
    1: 'ACTIVE',
    2: 'REVEALING',
    3: 'COMPLETED',
    4: 'FAILED',
    5: 'TIMEOUT'
  };
  return statusMap[status] || 'UNKNOWN';
}
