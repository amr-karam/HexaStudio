declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(config: { apiKey?: string; [key: string]: unknown });
    models: any;
    chats: any;
    interactions: any;
  }
  export type Content = any;
  export default GoogleGenAI;
}

declare module 'openai' {
  export class OpenAI {
    constructor(config?: { apiKey?: string; baseURL?: string; [key: string]: unknown });
    chat: any;
    embeddings: any;
  }

  export namespace OpenAI {
    export namespace Chat {
      export namespace Completions {
        export type ChatCompletionMessageParam = any;
        export type ChatCompletionTool = any;
        export type ChatCompletionMessageToolCall = any;
        export type ChatCompletionChunk = any;
      }
    }
  }

  export default OpenAI;
}

declare module 'openai/resources/chat/completions' {
  export type ChatCompletionMessageParam = any;
  export type ChatCompletionTool = any;
  export namespace Completions {
    export type ChatCompletionMessageToolCall = any;
    export type ChatCompletionChunk = any;
  }
}
