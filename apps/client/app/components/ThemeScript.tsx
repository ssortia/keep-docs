export default function ThemeScript() {
  const script = `
    (function() {
      try {
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;
        
        if (theme === 'dark') {
          document.documentElement.style.setProperty('--background', '#141414');
          document.documentElement.style.setProperty('--foreground', '#ffffff');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.style.setProperty('--background', '#ffffff');
          document.documentElement.style.setProperty('--foreground', '#171717');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}