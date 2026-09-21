/**
 * Linear Organic Cymatics & Audio Spectrum Wavefield Engine
 * Pure Black & White / Monochrome Edition
 * Simulates horizontal acoustic standing waves, Chladni nodal plate interference,
 * and linear audio frequency spectrum harmonics.
 */
(function () {
    'use strict';

    function initCymatics() {
        const container = document.getElementById('cymatics-container');
        const canvas = document.getElementById('cymatics-canvas');
        if (!container || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let animationFrameId = null;
        let isVisible = true;
        let time = 0;

        // Interactive mouse state
        const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, active: false, intensity: 0 };

        // Linear Spectrum Equalizer (72 vertical frequency bands)
        const BAR_COUNT = 72;
        const spectrum = new Float32Array(BAR_COUNT);
        const spectrumTarget = new Float32Array(BAR_COUNT);
        for (let i = 0; i < BAR_COUNT; i++) {
            spectrum[i] = 0.2 + Math.random() * 0.3;
            spectrumTarget[i] = spectrum[i];
        }

        // Chladni Nodal Particles (pure white floating dust)
        const PARTICLE_COUNT = 70;
        const particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random(),
                baseY: 0.25 + Math.random() * 0.5,
                offsetY: (Math.random() - 0.5) * 20,
                speedX: 0.0006 + Math.random() * 0.0012,
                size: 1.0 + Math.random() * 1.8,
                alpha: 0.25 + Math.random() * 0.65,
                freq: 2 + Math.floor(Math.random() * 4)
            });
        }

        function resize() {
            const rect = container.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width || 600;
            height = rect.height || 220;

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }

        function updateSimulation() {
            time += 0.016;

            // Smooth mouse interpolation
            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;
            mouse.intensity += ((mouse.active ? 1.0 : 0.0) - mouse.intensity) * 0.06;

            // Audio frequency bars calculation
            for (let i = 0; i < BAR_COUNT; i++) {
                const norm = i / BAR_COUNT;
                const wave1 = Math.sin(norm * 9 + time * 3.2);
                const wave2 = Math.cos(norm * 16 - time * 2.1);
                const wave3 = Math.sin(norm * 4 + time * 1.4);

                let target = 0.15 + 0.38 * Math.abs(wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.2);

                // Mouse ripple
                if (mouse.intensity > 0.01) {
                    const dist = Math.abs(norm - mouse.x);
                    if (dist < 0.28) {
                        const prox = 1 - dist / 0.28;
                        target += prox * mouse.intensity * 0.5 * (1 + Math.sin(time * 10 + i));
                    }
                }

                spectrumTarget[i] = Math.min(0.95, target);
                spectrum[i] += (spectrumTarget[i] - spectrum[i]) * 0.14;
            }
        }

        function draw() {
            if (!isVisible) return;

            updateSimulation();

            ctx.save();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);

            const centerY = height * 0.5;

            // 1. Subtle horizontal ambient glow (pure white/silver)
            const ambGrad = ctx.createRadialGradient(width * 0.5, centerY, 0, width * 0.5, centerY, width * 0.5);
            ambGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
            ambGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
            ambGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = ambGrad;
            ctx.fillRect(0, 0, width, height);

            // 2. Horizontal Tech Reticle Baseline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();

            // 3. Linear Audio Spectrum Equalizer (Centered mirror bars in Pure B&W)
            const barWidth = Math.max(2, (width / BAR_COUNT) - 2.5);
            const maxBarHeight = height * 0.38;

            for (let i = 0; i < BAR_COUNT; i++) {
                const x = (i / (BAR_COUNT - 1)) * (width - barWidth);
                const h = spectrum[i] * maxBarHeight;

                // Gradient from pure white at the tip to translucent silver at the baseline
                const grad = ctx.createLinearGradient(x, centerY - h, x, centerY + h);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
                grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
                grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
                grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)');
                grad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

                ctx.fillStyle = grad;
                // Mirrored vertical bar
                ctx.fillRect(x, centerY - h, barWidth, h * 2);

                // Peak dots on top and bottom
                if (spectrum[i] > 0.45) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x, centerY - h - 2.5, barWidth, 1.5);
                    ctx.fillRect(x, centerY + h + 1, barWidth, 1.5);
                }
            }

            // 4. Organic Chladni Standing Waves (Fluid ribbons in monochrome)
            // Ribbon 1: High-amplitude harmonic fundamental
            drawOrganicWave(centerY, 48, 2.6, time * 1.5, 0.006, 'rgba(255, 255, 255, 0.9)', 2.0, true);

            // Ribbon 2: Secondary harmonic interference wave (counter-flow)
            drawOrganicWave(centerY, 36, 4.2, -time * 1.8 + 1.2, 0.009, 'rgba(255, 255, 255, 0.55)', 1.5, false);

            // Ribbon 3: Complex 3rd harmonic fine wave
            drawOrganicWave(centerY, 24, 7.5, time * 2.2 + 2.5, 0.014, 'rgba(255, 255, 255, 0.35)', 1.2, false);

            // Ribbon 4: Inverted resonant envelope
            drawOrganicWave(centerY, -38, 3.1, time * 1.2 + Math.PI, 0.007, 'rgba(255, 255, 255, 0.45)', 1.4, false);

            // 5. Chladni Sound Particles (floating along linear acoustic nodes)
            drawLinearParticles(centerY);

            ctx.restore();

            animationFrameId = requestAnimationFrame(draw);
        }

        // Draw an organic fluid acoustic standing wave ribbon
        function drawOrganicWave(baseY, amp, freq, phase, k, strokeStyle, lineWidth, glow) {
            ctx.save();
            if (glow) {
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 10;
            }
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;

            ctx.beginPath();
            const step = 4;
            for (let x = 0; x <= width; x += step) {
                const normX = x / width;
                // Envelope that gently tapers at the edges
                const envelope = Math.sin(normX * Math.PI);

                // Multi-frequency sinusoidal equation simulating fluid acoustic vibrations
                const wave1 = Math.sin(normX * freq * Math.PI * 2 + phase);
                const wave2 = Math.cos(normX * (freq * 1.8) * Math.PI * 2 - phase * 1.3) * 0.45;
                const wave3 = Math.sin(normX * 1.5 * Math.PI * 2 + time * 0.8) * 0.3;

                // Mouse interaction displacement
                let mouseMod = 0;
                if (mouse.intensity > 0.01) {
                    const d = Math.abs(normX - mouse.x);
                    if (d < 0.3) {
                        mouseMod = Math.cos((d / 0.3) * (Math.PI / 2)) * mouse.intensity * 25 * Math.sin(time * 6);
                    }
                }

                const y = baseY + (wave1 + wave2 + wave3) * amp * envelope + mouseMod;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            ctx.restore();
        }

        // Floating white nodal particles
        function drawLinearParticles(baseY) {
            ctx.save();
            particles.forEach(p => {
                p.x += p.speedX * (1 + mouse.intensity * 0.8);
                if (p.x > 1) p.x = 0;

                const screenX = p.x * width;
                const waveOffset = Math.sin(p.x * p.freq * Math.PI * 2 + time * 2) * 28;
                const screenY = baseY + p.offsetY + waveOffset;

                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }

        // Mouse listeners
        function onMouseMove(e) {
            const rect = container.getBoundingClientRect();
            mouse.targetX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            mouse.targetY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            mouse.active = true;
        }

        function onMouseLeave() {
            mouse.targetX = 0.5;
            mouse.targetY = 0.5;
            mouse.active = false;
        }

        container.addEventListener('mousemove', onMouseMove, { passive: true });
        container.addEventListener('mouseleave', onMouseLeave, { passive: true });
        container.addEventListener('mouseenter', () => { mouse.active = true; }, { passive: true });

        // Touch support
        container.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const rect = container.getBoundingClientRect();
                mouse.targetX = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
                mouse.targetY = Math.max(0, Math.min(1, (e.touches[0].clientY - rect.top) / rect.height));
                mouse.active = true;
            }
        }, { passive: true });
        container.addEventListener('touchend', onMouseLeave, { passive: true });

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            resize();
        });
        resizeObserver.observe(container);

        // Intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!isVisible) {
                        isVisible = true;
                        resize();
                        animationFrameId = requestAnimationFrame(draw);
                    }
                } else {
                    isVisible = false;
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                }
            });
        }, { threshold: 0.05 });

        observer.observe(container);
        resize();
        animationFrameId = requestAnimationFrame(draw);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCymatics);
    } else {
        initCymatics();
    }

    if (typeof barba !== 'undefined' && barba.hooks) {
        barba.hooks.afterEnter(() => {
            initCymatics();
        });
    }
})();
