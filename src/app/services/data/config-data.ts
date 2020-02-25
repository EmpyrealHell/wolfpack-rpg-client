// tslint:disable: variable-name

/**
 * Class representing the user's config data. An instance is not used as a
 * class allows for default values without needing a separate defaults json.
 */
export class Config {
  /**
   * The user's app-wide settings.
   */
  Settings = new ConfigSettings();
  /**
   * The cached authentication data.
   */
  Authentication = new ConfigAuthentication();
  /**
   * List of widget ids, in order, to render to the widget container.
   */
  Layout = new Array<string>();
  /**
   * History of commands typed into the console.
   */
  History = new Array<string>();
}

/**
 * Represents the user's app-wide settings.
 */
export class ConfigSettings {
  /**
   * Whether or not to use the default dark theme.
   */
  UseDarkTheme = true;
  /**
   * Whether or not to show names on the buttons in the toolbar.
   */
  ToolbarNames = true;
  /**
   * Whether or not to show icons in the toolbar.
   */
  ToolbarIcons = true;
}

/**
 * Represents the user's cached authentication data.
 */
export class ConfigAuthentication {
  /**
   * The uniquely-generated state data used to verify the token's authenticity.
   */
  State: string | null = null;
  /**
   * OAuth token provided by Twitch.
   */
  Token: string | null = null;
  /**
   * Authenticated user's username.
   */
  User: string | null = null;
  /**
   * List of scopes the token provides access to.
   */
  Scope: string | null = null;
}
