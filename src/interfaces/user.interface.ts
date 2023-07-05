export interface UserProfile {
  email: string;
  nickname: string;
  profile_img: string;
  descript: string;

  nn_md_date: string;
  birth: string;
  _tr: boolean;
}

export interface UserInfo {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}
