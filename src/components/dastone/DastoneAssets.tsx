import Script from 'next/script';

export function DastoneAssets() {
  return (
    <>
      <link rel="shortcut icon" href="/dastone/images/favicon.ico" />
      <link rel="stylesheet" href="/dastone/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/dastone/css/icons.min.css" />
      <link rel="stylesheet" href="/dastone/css/app.min.css" />
      <Script src="/dastone/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/dastone/js/simplebar.min.js" strategy="afterInteractive" />
      <Script src="/dastone/js/app.js" strategy="afterInteractive" />
    </>
  );
}
