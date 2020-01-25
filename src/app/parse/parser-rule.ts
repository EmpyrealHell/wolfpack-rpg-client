
export class RuleResponse {
  constructor(public id: string, public pattern: RegExp, public output: Array<string>) { }
}

export class ParserRule {
  constructor(public command: string, public responses: Array<RuleResponse>) { }
}

export class ParserResult {
  constructor(public rule: ParserRule, public responseId: string) { }
}
