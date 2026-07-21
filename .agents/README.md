# GenPHD agent contracts

This directory holds small, versioned instructions that are used directly by
server-side AI features. It is not a folder for dormant prompts.

`registry.ts` currently powers the in-house content writer in
`lib/content/writer.ts`. The feature includes the returned prompt-contract
version so drafts remain traceable as the instruction evolves.
