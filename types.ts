export enum LightColorMode {
  WarmWhite = 'WARM_WHITE',
  MultiColor = 'MULTI_COLOR',
  BlueIce = 'BLUE_ICE'
}

export interface TreeSettings {
  lightsOn: boolean;
  colorMode: LightColorMode;
  snowEnabled: boolean;
}