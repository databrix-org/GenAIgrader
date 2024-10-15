import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {}
): Promise<T> {
  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(
    settings.baseUrl,
    'GenAIgrader', // API Namespace
    endPoint
  );

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    throw new ServerConnection.NetworkError(error as any);
  }

  let data: any = await response.text();

  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.log('Not a JSON response body.', response);
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error:', errorData);
    throw new ServerConnection.ResponseError(response, errorData.error || 'Unknown error', errorData);
  }

  return data;
}

export async function getAssignments(): Promise<any> {
  console.log('Requesting assignments from:', URLExt.join(ServerConnection.makeSettings().baseUrl, 'GenAIgrader', 'list-assignments'));
  try {
    return await requestAPI<any>('list-assignments');
  } catch (error) {
    console.error('Error in getAssignments:', error);
    if (error instanceof ServerConnection.ResponseError) {
      const errorData = await error.response.json();
      console.error('Detailed server error:', errorData);
    }
    throw error;
  }
}

export async function fetchAssignmentDetails(assignmentName: string): Promise<any> {
  console.log('Fetching assignment details for:', assignmentName);
  try {
    const response = await requestAPI<any>(`manage-assignment?assignment_name=${encodeURIComponent(assignmentName)}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Error in fetchAssignmentDetails:', error);
    if (error instanceof ServerConnection.ResponseError) {
      const errorData = await error.response.json();
      console.error('Detailed server error:', errorData);
    }
    throw error;
  }
}
