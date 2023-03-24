// tslint:disable: variable-name
export interface UserData {
  data: UserDatum[];
}

/**
 * Response interface from the Twitch get user service.
 */
export interface UserDatum {
  /**
   * Numeric id of the authenticated user.
   */
  id: string;
  /**
   * Username of the authenticated user.
   */
  login: string;
  /**
   * The user’s display name.
   */
  display_name: string;
  /**
   * The type of user. Possible values are:
   *   admin — Twitch administrator
   *   global_mod
   *   staff — Twitch staff
   *   "" — Normal user
   */
  type: string;
  /*
   * The type of broadcaster. Possible values are:
   *   affiliate — An affiliate broadcaster
   *   partner — A partner broadcaster
   *   "" — A normal broadcaster
   */
  broadcaster_type: string;
  /**
   * The user’s description of their channel.
   */
  description: string;
  /**
   * A URL to the user’s profile image.
   */
  profile_image_url: string;
  /**
   * A URL to the user’s offline image.
   */
  offline_image_url: string;
  /**
   * The number of times the user’s channel has been viewed.
   * NOTE: This field has been deprecated (see Get Users API endpoint –
   * “view_count” deprecation). Any data in this field is not valid and should
   * not be used.
   */
  view_count: number;
  /**
   * The user’s verified email address. The object includes this field only if
   * the user access token includes the user:read:email scope.
   * If the request contains more than one user, only the user associated with
   * the access token that provided consent will include an email address — the
   * email address for all other users will be empty.
   */
  email: string;
  /**
   * The UTC date and time that the user’s account was created. The timestamp is in RFC3339 format.
   */
  created_at: string;
}
