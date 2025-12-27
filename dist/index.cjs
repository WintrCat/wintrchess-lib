"use strict";const s=require("chessops"),o=s.Chess.default();for(const e of o.dests(s.parseSquare("a2")))console.log(`from: a2 - can go to: ${s.makeSquare(e)}`);
