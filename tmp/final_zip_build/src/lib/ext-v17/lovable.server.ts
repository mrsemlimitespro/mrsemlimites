const LOVABLE_BASE_URL = "https://api.lovable.dev";

export type LovableChatPayload = {
  message: string;
  files?: any[];
  thread_id?: string;
  selected_elements?: any[];
  current_page?: string;
  current_viewport_width?: number;
  current_viewport_height?: number;
  current_viewport_dpr?: number;
  session_replay?: string;
  ai_message_id?: string;
  model?: string | null;
  client_id?: string;
  integration_metadata?: any;
  [key: string]: any;
};

function getLovableHeaders(projectId: string, token: string) {
  const rawToken = token.replace(/^Bearer\s+/i, "");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${rawToken}`,
    "Accept": "text/event-stream, application/json",
    "Origin": "https://lovable.dev",
    "Referer": "https://lovable.dev/",
    "x-lovable-project-id": projectId,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  };
}

export async function proxyLovableChat(
  projectId: string,
  token: string,
  payload: LovableChatPayload
) {
  const url = `${LOVABLE_BASE_URL}/projects/${projectId}/chat`;
  const headers = getLovableHeaders(projectId, token);

  return await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export async function proxyLovableCommand(
  projectId: string,
  token: string,
  payload: any,
  endpoint: string = "chat"
) {
  const url = `${LOVABLE_BASE_URL}/projects/${projectId}/${endpoint}`;
  const headers = getLovableHeaders(projectId, token);

  return await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export async function proxyLovableStream(
  projectId: string,
  token: string,
  payload: any,
  endpoint: string = "chat"
) {
  const url = `${LOVABLE_BASE_URL}/projects/${projectId}/${endpoint}`;
  const headers = getLovableHeaders(projectId, token);
  headers["Accept"] = "text/event-stream";

  return await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}
