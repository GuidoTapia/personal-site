declare module '@components' {
  export * from '../components';
}

declare module '@components/icons' {
  export * from '../components/icons';
}

declare module '@config' {
  export * from '../config';
}

declare module '@styles' {
  export * from '../styles';
}

declare module '@utils' {
  export * from '../utils';
}

declare module '@utils/sr' {
  const sr: {
    reveal: (element: HTMLElement | null, config: any) => void;
  };
  export default sr;
}

declare module '@hooks' {
  export * from '../hooks';
}
