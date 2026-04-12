// CSS Module declarations
// 支持 CSS Modules 导入: import styles from './xxx.module.css'
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

// Global CSS declarations  
// 支持全局 CSS 导入: import './globals.css'
declare module '*.css' {
  const content: void;
  export default content;
}

declare module '*.scss' {
  const content: void;
  export default content;
}

declare module '*.sass' {
  const content: void;
  export default content;
}
