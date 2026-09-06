document.addEventListener('DOMContentLoaded', () => {

    // === 1. ЛОГИКА ЖИДКОГО СТЕКЛА С ПРОВЕРКОЙ БРАУЗЕРА ===
    const container = document.getElementById('glass-header');
    const feImage = document.getElementById('fe-glass-map');

    function supportsSVGFilters() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return false;
        const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        if (isWebkit || isFirefox) return false;
        
        const div = document.createElement('div');
        div.style.backdropFilter = 'url(#glass-filter)';
        return div.style.backdropFilter !== '';
    }

    if (container && !supportsSVGFilters()) {
        container.classList.remove('glass-surface--svg');
        container.classList.add('glass-surface--fallback');
    }

    function updateDisplacementMap() {
        if (!container || !feImage) return;
        
        const rect = container.getBoundingClientRect();
        const actualWidth = rect.width || 1100;
        const actualHeight = rect.height || 76;
        
        // ДИНАМИЧЕСКИЙ РАДИУС (Важно для адаптивности на телефонах)
        const borderRadius = Math.min(50, actualHeight / 2);
        const borderWidth = 0.07;
        const brightness = 50;
        const opacity = 0.93;
        const blur = 11;
        
        const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

        const svgContent = `
            <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="redGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#0000"/>
                        <stop offset="100%" stop-color="red"/>
                    </linearGradient>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0000"/>
                        <stop offset="100%" stop-color="blue"/>
                    </linearGradient>
                </defs>
                <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
                <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#redGrad)" />
                <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#blueGrad)" style="mix-blend-mode: screen" />
                <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
            </svg>
        `;
        
        const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
        feImage.setAttribute('href', dataUrl);
        feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataUrl);
    }

    const distortionScale = -180;
    const redChannel = document.getElementById('redchannel');
    const greenChannel = document.getElementById('greenchannel');
    const blueChannel = document.getElementById('bluechannel');
    
    if (redChannel && greenChannel && blueChannel) {
        redChannel.setAttribute('scale', (distortionScale + 0).toString());
        greenChannel.setAttribute('scale', (distortionScale + 10).toString());
        blueChannel.setAttribute('scale', (distortionScale + 20).toString());
    }

    updateDisplacementMap();
    if (window.ResizeObserver && container) {
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(updateDisplacementMap, 0);
        });
        resizeObserver.observe(container);
    } else {
        window.addEventListener('resize', updateDisplacementMap);
    }

    // === 2. ЛОГИКА СКРОЛЛА ЧАТА ===
    const featureBlocks = document.querySelectorAll('.feature-block');
    const messages = {
        1: document.getElementById('msg-1'),
        2: document.getElementById('msg-2'),
        3: [document.getElementById('msg-3'), document.getElementById('msg-4')]
    };

    const chatObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                featureBlocks.forEach(b => b.classList.remove('active'));
                entry.target.classList.add('active');

                const triggerId = entry.target.getAttribute('data-msg-trigger');
                
                if (triggerId == 1) messages[1].classList.add('show');
                if (triggerId == 2) {
                    messages[1].classList.add('show');
                    messages[2].classList.add('show');
                }
                if (triggerId == 3) {
                    messages[1].classList.add('show');
                    messages[2].classList.add('show');
                    messages[3][0].classList.add('show');
                    setTimeout(() => messages[3][1].classList.add('show'), 400);
                }
            }
        });
    }, { rootMargin: '-30% 0px -40% 0px' });

    featureBlocks.forEach(block => chatObserver.observe(block));

    // === 3. ПОЯВЛЕНИЕ ПРЕИМУЩЕСТВ ===
    const advCards = document.querySelectorAll('.fade-up');
    const advObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100); 
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 }); 

    advCards.forEach(card => advObserver.observe(card));

    // === 4. ПАРАЛЛАКС ДЛЯ ФОНА (Только для ПК) ===
    const blobs = document.querySelectorAll('.blob');
    if (window.innerWidth > 900) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            blobs.forEach((blob, index) => {
                const speed = (index + 1) * 20;
                const moveX = (x - 0.5) * speed;
                const moveY = (y - 0.5) * speed;
                blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }
});
