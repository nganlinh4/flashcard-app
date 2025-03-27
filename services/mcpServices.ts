import { useMCPTool } from '@/lib/mcp';

export const replicate = {
  create_prediction: async (params: {
    model: string;
    input: Record<string, any>;
  }) => {
    return useMCPTool({
      server_name: 'replicate',
      tool_name: 'create_prediction',
      arguments: params
    });
  }
};

export const googleSearch = {
  search: async (query: string, limit: number = 5) => {
    return useMCPTool({
      server_name: 'google-search',
      tool_name: 'google-search',
      arguments: { query, limit }
    });
  }
};