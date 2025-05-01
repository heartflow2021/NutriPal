import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh-TW">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#4CAF50" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Google Analytics 程式碼可以放在這裡 */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 