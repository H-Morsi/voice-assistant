// Nvidia NIM Service for Orchestrator & Sub-Agent Delegation
// Handles complex task delegation using Nvidia NIM LLMs

import OpenAI from 'openai'

let client = null
let orchestratorModel = 'nvidia/nemotron-3-ultra'
let subAgentModel = 'nvidia/nemotron-3-ultra'
let baseUrl = 'https://integrate.api.nvidia.com/v1'

function getClient(apiKey, customBaseUrl) {
  if (!client || customBaseUrl !== baseUrl) {
    baseUrl = customBaseUrl || baseUrl
    client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      dangerouslyAllowBrowser: true,
    })
  }
  return client
}

export function resetClient() {
  client = null
}

export function setModels(orchestrator, subAgent) {
  orchestratorModel = orchestrator
  subAgentModel = subAgent
}

export function initializeNvidia() {
  // Reset client to force reinitialization with current settings
  resetClient()
}

export function setBaseUrl(url) {
  baseUrl = url
  client = null // Force recreate
}

// Tool definitions for orchestrator
const ORCHESTRATOR_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'delegate_to_sub_agent',
      description: 'Delegate a complex sub-task to a specialized sub-agent. Use for research, coding, analysis, or multi-step tasks.',
      parameters: {
        type: 'object',
        properties: {
          task_type: {
            type: 'string',
            enum: ['research', 'code', 'analysis', 'summarize', 'plan'],
            description: 'Type of sub-agent to spawn'
          },
          task_description: {
            type: 'string',
            description: 'Detailed description of what the sub-agent should do'
          },
          context: {
            type: 'string',
            description: 'Relevant context from the current conversation/screen'
          },
          expected_output: {
            type: 'string',
            description: 'What format the result should be in (e.g., "markdown report", "code snippet", "bullet points")'
          },
        },
        required: ['task_type', 'task_description', 'context', 'expected_output'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'capture_screen',
      description: 'Capture the current screen to understand user context',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web for current information',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          num_results: { type: 'number', default: 5 },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'execute_command',
      description: 'Execute a shell command (use carefully)',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string' },
          working_directory: { type: 'string' },
        },
        required: ['command'],
      },
    },
  },
]

// System prompt for orchestrator
export function buildOrchestratorPrompt(screenContext = '', conversationHistory = '') {
  return `You are the Orchestrator Agent for a desktop voice assistant. You can see the user's screen and hear their voice.

CURRENT SCREEN CONTEXT:
${screenContext || 'No screen context available'}

RECENT CONVERSATION:
${conversationHistory || 'No recent conversation'}

YOUR ROLE:
- Handle simple queries directly (weather, quick facts, simple explanations)
- For COMPLEX tasks, delegate to specialized sub-agents using the delegate_to_sub_agent tool
- Complex tasks include: research, coding, analysis, multi-step planning, summarization of large content
- Always consider screen context when relevant

DELEGATION GUIDELINES:
- research: Web research, fact-finding, comparing sources
- code: Writing, debugging, explaining code, refactoring
- analysis: Data analysis, log analysis, performance analysis
- summarize: Long documents, meetings, articles
- plan: Multi-step project planning, task breakdown

When delegating, provide rich context so the sub-agent works effectively.
After sub-agent returns, synthesize the result into a clear, concise response.

Keep responses conversational and concise for voice output (1-3 sentences).
For delegated tasks, say "Let me delegate that to a specialist..." then return synthesized result.`
}

// Main orchestrator chat completion
export async function chatOrchestrator(apiKey, messages, onStream) {
  const openai = getClient(apiKey)
  
  const response = await openai.chat.completions.create({
    model: orchestratorModel,
    messages,
    tools: ORCHESTRATOR_TOOLS,
    tool_choice: 'auto',
    stream: true,
    temperature: 0.3,
    max_tokens: 2048,
  })
  
  let fullContent = ''
  let toolCalls = []
  
  for await (const chunk of response) {
    const delta = chunk.choices?.[0]?.delta
    
    if (delta?.content) {
      fullContent += delta.content
      if (onStream) onStream(fullContent)
    }
    
    if (delta?.tool_calls) {
      for (const tc of delta.tool_calls) {
        if (tc.index === toolCalls.length) {
          toolCalls.push({ id: tc.id, name: '', arguments: '' })
        }
        const current = toolCalls[toolCalls.length - 1]
        if (tc.function?.name) current.name = tc.function.name
        if (tc.function?.arguments) current.arguments += tc.function.arguments
      }
    }
  }
  
  return { content: fullContent, toolCalls }
}

// Sub-agent execution
export async function executeSubAgent(apiKey, taskType, taskDescription, context, expectedOutput, onStream) {
  const openai = getClient(apiKey)
  
  const systemPrompts = {
    research: `You are a Research Sub-Agent. Your job: find accurate, up-to-date information from the web.
Given a research question and context, search for relevant information and synthesize a clear answer.
Output format: ${expectedOutput || 'markdown report with sources'}`,
    
    code: `You are a Code Sub-Agent. Your job: write, debug, explain, or refactor code.
Given a coding task and context, produce clean, working code with explanations.
Output format: ${expectedOutput || 'code snippet with explanation'}`,
    
    analysis: `You are an Analysis Sub-Agent. Your job: analyze data, logs, or technical information.
Given data and context, provide insights, patterns, and actionable findings.
Output format: ${expectedOutput || 'structured analysis with key findings'}`,
    
    summarize: `You are a Summarization Sub-Agent. Your job: condense long content into key points.
Given content and context, extract the most important information.
Output format: ${expectedOutput || 'bullet-point summary'}`,
    
    plan: `You are a Planning Sub-Agent. Your job: break down complex goals into actionable steps.
Given a goal and context, create a clear, prioritized plan.
Output format: ${expectedOutput || 'numbered plan with dependencies'}`,
  }
  
  const systemPrompt = systemPrompts[taskType] || systemPrompts.research
  
  const response = await openai.chat.completions.create({
    model: subAgentModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Task: ${taskDescription}\n\nContext: ${context}\n\nExpected output: ${expectedOutput}` },
    ],
    stream: true,
    temperature: 0.2,
    max_tokens: 4096,
  })
  
  let fullContent = ''
  for await (const chunk of response) {
    const text = chunk.choices?.[0]?.delta?.content || ''
    fullContent += text
    if (onStream) onStream(fullContent)
  }
  
  return fullContent
}

// Simple chat completion (for non-streaming)
export async function chatComplete(apiKey, messages, model = orchestratorModel) {
  const openai = getClient(apiKey)
  
  const response = await openai.chat.completions.create({
    model,
    messages,
    stream: false,
    temperature: 0.3,
    max_tokens: 2048,
  })
  
  return response.choices?.[0]?.message?.content || ''
}