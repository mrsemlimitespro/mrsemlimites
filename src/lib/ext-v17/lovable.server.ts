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

export async function proxyLovableChat(
  projectId: string,
  token: string,
  lastPayload: LovableChatPayload
) {
  const url = `${LOVABLE_BASE_URL}/projects/${projectId}/chat`;
  const rawToken = token.replace(/^Bearer\s+/i, "");

  // Rule: Preserve all fields from lastPayload
  // ai_message_id must be preserved if it exists
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${rawToken}`,
    "Accept": "*/*",
    "Origin": "https://lovable.dev",
    "Referer": "https://lovable.dev/",
    "x-lovable-project-id": projectId,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(lastPayload),
  });

  return response;
}

export async function proxyLovableCommand(
  projectId: string,
  token: string,
  payload: any
) {
  // O motor v17.0 às vezes usa send-command para operações que também batem no /chat
  // ou em rotas específicas se documentado. Por padrão, usamos a mesma lógica de transporte.
  const url = `${LOVABLE_BASE_URL}/projects/${projectId}/chat`;
  const rawToken = token.replace(/^Bearer\s+/i, "");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${rawToken}`,
      "x-lovable-project-id": projectId,
      "Origin": "https://lovable.dev",
      "Referer": "https://lovable.dev/",
    },
    body: JSON.stringify(payload),
  });

  return response;
}
