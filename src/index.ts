import { CommentaryEngine } from "./commentary";

const commentary = new CommentaryEngine({
    llm: {
        model: "aaa",
        apiKey: "",
        baseURL: ""
    },
    engine: {
        path: ""
    }
});