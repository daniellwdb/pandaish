interface CommandErrorContext {
  commandName: string;
}

export class CommandError extends Error {
  constructor(message: string, public readonly context: CommandErrorContext) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
