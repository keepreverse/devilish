document.addEventListener('DOMContentLoaded', function() {
    // Собираем данные только после загрузки DOM
    const trackingData = {
        sw: screen.width,
        sh: screen.height,
        cpu: navigator.hardwareConcurrency || null
    };

    // Определение GPU
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            trackingData.gpu = debugInfo ? 
                gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
        }
    } catch (e) {}

    // Сетевые данные
    if (navigator.connection) {
        trackingData.et = navigator.connection.effectiveType || 'unknown';
    }

    // Функция отправки данных
    function sendTracking() {
        trackingData.lt = Math.round(performance.now());
        
        const params = new URLSearchParams();
        for (const key in trackingData) {
            if (trackingData[key] !== null) {
                params.append(key, trackingData[key]);
            }
        }

        // Отправляем через Image (надежнее)
        new Image().src = `log.php?${params.toString()}`;
    }

    // Запускаем отправку
    sendTracking();
});