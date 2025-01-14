import { print, prompt } from 'gluegun'
import type { FileData, MessageCompletion } from '../types'

type CheckAIResponseForErrorOptions = {
  aiResponse: MessageCompletion
  sourceFileContents: string
  fileData: FileData
}

type CheckAIResponseForErrorResult = {
  next: 'retry' | 'skip' | 'continue'
}

export async function checkAIResponseForError({
  aiResponse,
  sourceFileContents,
  fileData,
}: CheckAIResponseForErrorOptions): Promise<CheckAIResponseForErrorResult> {
  if (!aiResponse.content) return { next: 'continue' }

  // if we're being rate limited, we need to stop for a bit and try again
  if (aiResponse.content.includes('too_many_requests')) {
    print.error(`🛑 I'm being rate limited. Wait a while and try again.\n`)
    const retry = await prompt.confirm('Try again or skip this file?')
    if (retry) return { next: 'retry' }
    return { next: 'skip' }
  } else if (aiResponse.content.includes('context_length_exceeded')) {
    const len = sourceFileContents.length
    print.error(`🛑 File is too long (${len} characters), skipping! Not enough tokens.`)
    fileData.change = 'skipped'
    fileData.error = 'file too long'
    return { next: 'skip' }
  } else if (aiResponse.content.includes('unknown_error')) {
    print.error(`🛑 Unknown error, skipping!`)
    fileData.change = 'skipped'
    fileData.error = 'unknown error'
    return { next: 'skip' }
  }

  return { next: 'continue' }
}
