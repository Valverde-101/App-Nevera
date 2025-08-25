import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob';

const adUnitID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/2934735716',
  android: 'ca-app-pub-3940256099942544/6300978111',
});

export default function AdBanner() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;

    const script = document.createElement('script');
    script.async = true;
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3940256099942544';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', 'ca-pub-3940256099942544');
    ins.setAttribute('data-ad-slot', '1234567890');
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    ins.setAttribute('data-adtest', 'on');
    containerRef.current.appendChild(ins);

    script.onload = () => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    };

    return () => {
      document.head.removeChild(script);
      containerRef.current?.removeChild(ins);
    };
  }, []);

  if (Platform.OS === 'web') {
    return <div ref={containerRef} />;
  }

  return (
    <AdMobBanner
      bannerSize="smartBannerPortrait"
      adUnitID={adUnitID}
      servePersonalizedAds
      onDidFailToReceiveAdWithError={(e) => console.log(e)}
    />
  );
}
