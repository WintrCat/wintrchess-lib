# 📚 WintrChess Library

TypeScript library with Chess operations and tools for WintrChess.

###### For the time being, documentation is provided via JSDoc.

## Subpackages
`wintrchess/engine` - UCI engine class for a browser runtime, and analysis related functions.

`wintrchess/engine/node` - A UCI engine for a Node.js runtime.

`wintrchess/coach` - Natural language move and position explanations, using a concrete Chess engine for analysis, and LLM for personality and language construction.

`wintrchess/classify` **(WIP)** - Move classifications (brilliant, blunder etc.)

`wintrchess/utils` - Utility functions for random Chess stuff.

`wintrchess/types` - All the miscellaneous TypeScript types.

## Compiling

- `pnpm install` / `npm install`

- `pnpm build` / `npm run build`

> [!NOTE]
> This is not currently in use on the live WintrChess deployment.
> But it will be eventually! ✨