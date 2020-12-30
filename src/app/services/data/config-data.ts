// tslint:disable: variable-name

/**
 * Class representing the user's config data. An instance is not used as a
 * class allows for default values without needing a separate defaults json.
 */
export class Config {
  /**
   * The user's app-wide settings.
   */
  settings = new ConfigSettings();
  /**
   * The cached authentication data.
   */
  authentication = new ConfigAuthentication();
  /**
   * List of widget ids, in order, to render to the widget container.
   */
  layout = new Array<string>();
  /**
   * History of commands typed into the console.
   */
  history = new Array<string>();
}

/**
 * Represents the user's app-wide settings.
 */
export class ConfigSettings {
  /**
   * Whether or not to use the default dark theme.
   */
  useDarkTheme = true;
  /**
   * Whether or not to show names on the buttons in the toolbar.
   */
  toolbarNames = true;
  /**
   * Whether or not to show icons in the toolbar.
   */
  toolbarIcons = true;
  /**
   * Whether or not to play sounds for things like the fishing widget.
   */
  playSounds = true;
}

/**
 * Represents the user's cached authentication data.
 */
export class ConfigAuthentication {
  /**
   * The uniquely-generated state data used to verify the token's authenticity.
   */
  state: string | null = null;
  /**
   * OAuth token provided by Twitch.
   */
  token: string | null = null;
  /**
   * Authenticated user's username.
   */
  user: string | null = null;
  /**
   * List of scopes the token provides access to.
   */
  scope: string | null = null;
}
