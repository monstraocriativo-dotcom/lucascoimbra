/**
 * Hero Slideshow Controller - Lucas Coimbra Portfolio
 * 
 * Regras Atualizadas:
 * 1. Imagens: Covers (sem vinci e inserir) + Posters Variados + Kingston (Total: 55 imagens).
 * 2. Ordem: 100% aleatória (Fisher-Yates Shuffle) a cada ciclo completo, garantindo que TODAS as 55 imagens apareçam sem repetições na rodada.
 * 3. Duração: O dobro da velocidade anterior (~1500ms por slide com transição rápida e fluida).
 * 4. Sem regra de 30s: loop contínuo infinito entre as 55 imagens embaralhadas.
 */

(function() {
    'use strict';

    // Configuração de velocidade: dobro da velocidade anterior
    var SLIDE_DURATION = 1500; // 1.5s por imagem

    var allSlides = window.HERO_ALL_SLIDES || [];

    if (!allSlides.length) {
        console.warn('[Hero Slideshow] Nenhuma imagem encontrada em window.HERO_ALL_SLIDES.');
        return;
    }

    // Elementos do DOM
    var container = document.getElementById('hero-slideshow-container');
    var layerA = document.getElementById('hero-slide-layer-a');
    var layerB = document.getElementById('hero-slide-layer-b');
    var imgA = document.getElementById('hero-slide-img-a');
    var imgB = document.getElementById('hero-slide-img-b');
    var progressBar = document.getElementById('hero-slide-progress-bar');
    var phaseDot = document.getElementById('hero-slide-phase-dot');
    var phaseLabel = document.getElementById('hero-slide-phase-label');
    var counterEl = document.getElementById('hero-slide-counter');
    var titleEl = document.getElementById('hero-slide-title');

    if (!container || !layerA || !layerB || !imgA || !imgB) {
        return;
    }

    // Estado interno
    var playlist = [];
    var currentIndex = 0;
    var activeLayer = 'A'; // 'A' | 'B'
    var timerId = null;
    var progressIntervalId = null;
    var isPaused = false;
    var lastItem = null;

    // Algoritmo Fisher-Yates para embaralhamento perfeito
    function shuffleArray(items, avoidFirst) {
        var arr = items.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        // Evita que o primeiro item do novo ciclo seja idêntico ao último do ciclo anterior
        if (avoidFirst && arr.length > 1 && arr[0].src === avoidFirst.src) {
            var swapIdx = Math.floor(Math.random() * (arr.length - 1)) + 1;
            var t = arr[0];
            arr[0] = arr[swapIdx];
            arr[swapIdx] = t;
        }
        return arr;
    }

    // Pré-carregador de imagem para evitar delay na troca
    function preloadImage(url) {
        if (!url) return;
        var img = new Image();
        img.src = url;
    }

    // Pré-carrega os próximos slides da playlist
    function preloadNext() {
        for (var k = 1; k <= 3; k++) {
            var nextIdx = (currentIndex + k) % playlist.length;
            if (playlist[nextIdx]) {
                preloadImage(playlist[nextIdx].src);
            }
        }
    }

    // Transição suave de imagem entre as camadas A e B
    function transitionTo(item, indexNum, totalNum) {
        if (!item || !item.src) return;

        var nextLayer = (activeLayer === 'A') ? layerB : layerA;
        var currentLayer = (activeLayer === 'A') ? layerA : layerB;
        var nextImg = (activeLayer === 'A') ? imgB : imgA;

        // Atualiza imagem na camada que vai entrar
        nextImg.src = item.src;
        nextImg.alt = item.title || 'Lucas Coimbra • Trabalho';

        // Atualiza legendas e indicadores
        if (titleEl) {
            titleEl.textContent = item.title || 'Trabalho Selecionado';
        }

        if (phaseLabel) {
            phaseLabel.textContent = item.category || 'Destaque';
        }

        if (phaseDot) {
            // Cor do dot variando suavemente por categoria para dinamismo visual
            if (item.category === 'Covers') {
                phaseDot.className = 'size-2 rounded-full bg-emerald-400 animate-pulse';
            } else if (item.category === 'Posters') {
                phaseDot.className = 'size-2 rounded-full bg-cyan-400 animate-pulse';
            } else {
                phaseDot.className = 'size-2 rounded-full bg-amber-400 animate-pulse';
            }
        }

        if (counterEl) {
            counterEl.textContent = (indexNum + 1) + ' / ' + totalNum;
        }

        // Troca de camadas com crossfade ágil
        nextLayer.style.zIndex = '2';
        currentLayer.style.zIndex = '1';

        requestAnimationFrame(function() {
            nextLayer.classList.remove('opacity-0');
            nextLayer.classList.add('opacity-100');
            nextLayer.classList.add('is-zooming');

            currentLayer.classList.remove('opacity-100');
            currentLayer.classList.add('opacity-0');
            currentLayer.classList.remove('is-zooming');

            activeLayer = (activeLayer === 'A') ? 'B' : 'A';
        });

        lastItem = item;
    }

    // Barra de progresso sincronizada com a velocidade rápida
    function startProgressBar(duration) {
        if (!progressBar) return;
        clearInterval(progressIntervalId);
        var start = Date.now();

        progressBar.style.width = '0%';
        progressBar.style.transition = 'none';

        progressIntervalId = setInterval(function() {
            if (isPaused) return;
            var elapsed = Date.now() - start;
            var pct = Math.min(100, (elapsed / duration) * 100);
            progressBar.style.width = pct + '%';
            if (elapsed >= duration) {
                clearInterval(progressIntervalId);
            }
        }, 20);
    }

    // Avança para o próximo slide
    function nextSlide() {
        if (isPaused) return;

        if (currentIndex >= playlist.length) {
            // Terminou todas as 55 imagens! Gera nova ordem 100% aleatória para a próxima rodada
            playlist = shuffleArray(allSlides, lastItem);
            currentIndex = 0;
        }

        var item = playlist[currentIndex];
        transitionTo(item, currentIndex, playlist.length);
        startProgressBar(SLIDE_DURATION);
        preloadNext();

        timerId = setTimeout(function() {
            currentIndex++;
            nextSlide();
        }, SLIDE_DURATION);
    }

    // Inicialização
    function init() {
        // Gera a primeira playlist em ordem aleatória
        playlist = shuffleArray(allSlides, null);
        currentIndex = 0;

        // Inicia com a primeira imagem sorteada
        if (playlist.length > 0) {
            transitionTo(playlist[0], 0, playlist.length);
            startProgressBar(SLIDE_DURATION);
            preloadNext();

            timerId = setTimeout(function() {
                currentIndex = 1;
                nextSlide();
            }, SLIDE_DURATION);
        }

        // Pausa temporária se a aba não estiver visível
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                isPaused = true;
                clearTimeout(timerId);
                clearInterval(progressIntervalId);
            } else {
                isPaused = false;
                nextSlide();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
