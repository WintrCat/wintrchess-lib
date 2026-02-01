import chalk from "chalk";

type LogType = "success" | "info" | "warn" | "error";

const logIcons: Record<LogType, string> = {
    success: chalk.green("✓"),
    info: chalk.blue("!"),
    warn: chalk.yellow("!"),
    error: chalk.red("x")
};

export function log(type: LogType, messsage: string) {
    console.log(`[${logIcons[type]}] ${messsage}`);
}