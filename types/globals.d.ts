// src/types/globals.d.ts (ou src/globals.d.ts)
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Opcional: se usar CSS Modules (ex: styles.module.css)
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}