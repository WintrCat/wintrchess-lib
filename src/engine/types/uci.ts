export type UCICommand = (string & {})
    | "uci"
    | "debug"
    | "isready"
    | "setoption"
    | "register"
    | "ucinewgame"
    | "position"
    | "go"
    | "stop"
    | "ponderhit"
    | "quit";

export type UCIOption = (string & {})
    | "Threads"
    | "Hash"
    | "Ponder"
    | "OwnBook"
    | "MultiPV"
    | "UCI_LimitStrength"
    | "UCI_Elo";

export type UCIValue = string | boolean | number;