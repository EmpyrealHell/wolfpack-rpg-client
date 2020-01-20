export class Config {
  public Settings = new ConfigSettings();
  public Authentication = new ConfigAuthentication();
}

export class ConfigSettings {
  public UseDarkTheme = true;
}

export class ConfigAuthentication {
  public State: string;
  public Token: string;
  public User: string;
  public Scope: string;
}
