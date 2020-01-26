/**
 * Class representing the user's config data. An instance is not used as a
 * class allows for default values without needing a separate defaults json.
 */
export class Config {
  /**
   * The user's app-wide settings.
   */
  public Settings = new ConfigSettings();
  /**
   * The cached authentication data.
   */
  public Authentication = new ConfigAuthentication();
  /**
   * List of widget ids, in order, to render to the widget container.
   */
  public Layout = new Array<string>();
}

/**
 * Represents the user's app-wide settings.
 */
export class ConfigSettings {
  /**
   * Whether or not to use the default dark theme.
   */
  public UseDarkTheme = true;
}

/**
 * Represents the user's cached authentication data.
 */
export class ConfigAuthentication {
  /**
   * The uniquely-generated state data used to verify the token's authenticity.
   */
  public State: string;
  /**
   * OAuth token provided by Twitch.
   */
  public Token: string;
  /**
   * Authenticated user's username.
   */
  public User: string;
  /**
   * List of scopes the token provides access to.
   */
  public Scope: string;
}
