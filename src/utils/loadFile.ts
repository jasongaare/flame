import { filesystem } from 'gluegun'
import { ChatCompletionRequestMessage } from 'openai'

type Message = ChatCompletionRequestMessage & {
  age?: number
}

export async function loadFile(fileName: string, workingFolder: string) {
  // read the file
  const fileContents = await filesystem.readAsync(`${workingFolder}/${fileName}`, 'utf8')

  // add the file contents to the prompt
  const message: Message = {
    content: `
  Here's the contents of ${fileName}:

  \`\`\`
  ${fileContents}
  \`\`\`
          `,
    role: 'user',
    age: 5,
  }

  return { message, fileContents }
}