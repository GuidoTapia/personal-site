import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      green: string;
      navy: string;
      darkNavy: string;
    };
    mixins: {
      flexCenter: string;
      flexBetween: string;
      resetList: string;
      boxShadow: string;
      inlineLink: string;
      bigButton: string;
      smallButton: string;
    };
  }
}
