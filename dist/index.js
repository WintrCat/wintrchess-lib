import { Chess as s, parseSquare as e, makeSquare as a } from "chessops";
const r = s.default();
for (const o of r.dests(e("a2")))
  console.log(`from: a2 - can go to: ${a(o)}`);
