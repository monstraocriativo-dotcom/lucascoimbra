function pageScripts() {
    // Copy URL to clipboard
    document.querySelectorAll('.js-copy-url').forEach((element) => {
        element.addEventListener('click', () => {
            navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                    alert('Link copiado para a área de transferência');
                })
                .catch(() => {
                    alert('Algo deu errado ao tentar copiar o link');
                });
        })
    });



    // Scroll to anchor
    document.querySelectorAll('.js-smooth').forEach(element => {
        element.addEventListener('click', (e) => {
            var target = element.getAttribute('data-target');
            e.preventDefault();
            lenis.scrollTo(target, { offset: -80, duration: 1, delay: 2 });
        });
    });



    // Magnetic links
    (function() {
        const links = document.querySelectorAll('.js-magnetic-container');
      
        const animateMe = function(e) {
          const objects = this.querySelectorAll('.js-magnetic-object');
          const { offsetX: x, offsetY: y } = e,
                { offsetWidth: width, offsetHeight: height } = this;
                
          objects.forEach(object => {
            const move = object.dataset.move || 80;
            const xMove = x / width * (move * 2) - move;
            const yMove = y / height * (move * 2) - move;

            object.style.transform = `translate(${xMove}px, ${yMove}px)`;
            if (e.type === 'mouseleave') objects.forEach(object => object.style.transform = '');
          });
        };
        
        links.forEach(link => link.addEventListener('mousemove', animateMe));
        links.forEach(link => link.addEventListener('mouseleave', animateMe));
    })();



    // Tabs/Filter
    document.querySelectorAll('.js-filter-button').forEach((element) => {
        element.addEventListener('click', () => {
            var target = element.getAttribute('data-filter');

            document.querySelectorAll('.js-filter-object').forEach((object) => {
                object.style.display = 'none';
                object.classList.add('u-filter-hidden');
            });
            document.querySelectorAll('.js-filter-object[data-filter="' + target + '"]').forEach((object) => {
                object.style.display = '';
                setTimeout(() => {
                    object.classList.remove('u-filter-hidden');
                }, 200);
            });

            document.querySelectorAll('.js-filter-button').forEach((object) => {
                object.classList.remove('js-filter-active');
            });
            element.classList.add('js-filter-active');

            ScrollTrigger.refresh();
            ScrollTrigger.update();
        });
    });

    document.querySelectorAll('.js-filter-button-all').forEach((element) => {
        element.addEventListener('click', () => {
            document.querySelectorAll('.js-filter-object').forEach((object) => {
                object.style.display = 'none';
                object.classList.add('u-filter-hidden');
                object.style.display = '';
                setTimeout(() => {
                    object.classList.remove('u-filter-hidden');
                }, 200);
            });

            document.querySelectorAll('.js-filter-button').forEach((object) => {
                object.classList.remove('js-filter-active');
            });
            element.classList.add('js-filter-active');

            ScrollTrigger.refresh();
            ScrollTrigger.update();
        });
    });



    // Toggle
    const toggleContainers = document.querySelectorAll('.js-toggle-container');
    
    if (toggleContainers.length) {
        toggleContainers.forEach(container => {
            const triggers = container.querySelectorAll('.js-toggle-trigger');
            const closeOnOutside = container.hasAttribute('data-toggle-close');
            const closeOtherInSameContainer = container.hasAttribute('data-toggle-close-other');
            
            if (triggers.length) {
                triggers.forEach(trigger => {
                    trigger.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        // Close all other active toggles only if this toggle has data-toggle-close
                        if (closeOnOutside) {
                            toggleContainers.forEach(otherContainer => {
                                if (otherContainer !== container && otherContainer.classList.contains('is-active')) {
                                    otherContainer.classList.remove('is-active');
                                }
                            });
                        }
                        
                        // Close other toggles within the same container if data-toggle-close-other is set
                        if (closeOtherInSameContainer) {
                            // Find the closest common parent that contains multiple toggle containers
                            let parentContainer = container.parentElement;
                            while (parentContainer && parentContainer.querySelectorAll('.js-toggle-container').length <= 1) {
                                parentContainer = parentContainer.parentElement;
                            }
                            
                            if (parentContainer) {
                                const siblingToggles = parentContainer.querySelectorAll('.js-toggle-container');
                                siblingToggles.forEach(siblingToggle => {
                                    if (siblingToggle !== container && siblingToggle.classList.contains('is-active')) {
                                        siblingToggle.classList.remove('is-active');
                                    }
                                });
                            }
                        }
                        
                        container.classList.toggle('is-active');
                        setTimeout(() => {
                            ScrollTrigger.refresh();
                            ScrollTrigger.update();
                        }, 0);
                    });
                });
            }

            if (closeOnOutside) {
                document.addEventListener('click', (e) => {
                    if (container.classList.contains('is-active') && 
                        !container.contains(e.target)) {
                        container.classList.remove('is-active');
                        ScrollTrigger.refresh();
                        ScrollTrigger.update();
                    }
                });
            }
        });
    }



    // Modal
    var modal_containers = document.querySelectorAll('.js-modal-container');
    if (modal_containers) {
        modal_containers.forEach((container) => {
            let div = document.createElement("div");
            div.innerHTML = container.querySelectorAll('.js-modal-object')[0].innerHTML;

            // Modal open logic
            container.querySelectorAll('.js-modal-button').forEach((button) => {
                button.addEventListener('click', () => {
                    document.querySelectorAll('main')[0].appendChild(div);

                    setTimeout(() => {
                        var cf_selector = 'div.wpcf7 > form';
                        var formsInModal = div.querySelectorAll(cf_selector);
                        if (formsInModal.length > 0) {
                            formsInModal.forEach((element) => {
                                wpcf7.init(element);
                            });
                        }
                    }, 10);
                });
            });

            // Modal close logic
            div.querySelectorAll('.js-modal-close').forEach((close) => {
                close.addEventListener('click', () => {
                    div.querySelectorAll('.js-modal-backdrop').forEach((backdrop) => {
                        backdrop.classList.add('animate-[fadeOut_0.7s_ease_forwards]');
                    });
                    div.querySelectorAll('.js-modal-content').forEach((content) => {
                        content.classList.add('animate-[slideDown_0.7s_cubic-bezier(.23,1,.32,1)_forwards]');
                    });
                    setTimeout(() => {
                        div.querySelectorAll('.js-modal-backdrop').forEach((backdrop) => {
                            backdrop.classList.remove('animate-[fadeOut_0.7s_ease_forwards]');
                        });
                        div.querySelectorAll('.js-modal-content').forEach((content) => {
                            content.classList.remove('animate-[slideDown_0.7s_cubic-bezier(.23,1,.32,1)_forwards]');
                        });
                        div.remove();
                    }, 700)
                });
            });
        });
    }



    // Maska
    const { Mask, MaskInput } = Maska;

    new MaskInput("[data-maska]");
    const mask = new Mask({ mask: "['(##) ####-####', '(##) #####-####']" });



    // KeenSlider
    function navigation(slider) {
        let wrapper, dots, arrows, arrowLeft, arrowRight

        function markup(remove) {
            wrapperMarkup(remove)
            dotMarkup(remove)
            arrowMarkup(remove)
        }

        function removeElement(element) {
            element.parentNode.removeChild(element)
        }
        function createDiv(className) {
            var div = document.createElement('div')
            var classNames = className.split(' ')
            classNames.forEach((name) => div.classList.add(name))
            return div
        }

        function arrowMarkup(remove) {
            if (remove) {
                removeElement(arrowLeft)
                removeElement(arrowRight)
                return
            }
            arrows = createDiv('c-carousel__arrows')
            arrowLeft = createDiv('c-carousel__arrow c-carousel__arrow--left')
            arrowLeft.addEventListener('click', () => slider.prev())
            arrowRight = createDiv('c-carousel__arrow c-carousel__arrow--right')
            arrowRight.addEventListener('click', () => slider.next())

            wrapper.appendChild(arrows)
            arrows.appendChild(arrowLeft)
            arrows.appendChild(arrowRight)
        }

        function wrapperMarkup(remove) {
            if (remove) {
                var parent = wrapper.parentNode
                while (wrapper.firstChild)
                    parent.insertBefore(wrapper.firstChild, wrapper)
                removeElement(wrapper)
                return
            }
            wrapper = createDiv('c-carousel__navigation')
            slider.container.parentNode.appendChild(wrapper)
            wrapper.appendChild(slider.container)
        }

        function dotMarkup(remove) {
            if (remove) {
                removeElement(dots)
                return
            }
            dots = createDiv('c-carousel__dots')
            slider.track.details.slides.forEach((_e, idx) => {
                var dot = createDiv('c-carousel__dot')
                dot.addEventListener('click', () => slider.moveToIdx(idx))
                dots.appendChild(dot)
            })
            wrapper.appendChild(dots)
        }

        function updateClasses() {
            var slide = slider.track.details.rel
            slide === 0
                ? arrowLeft.classList.add('c-carousel__arrow--disabled')
                : arrowLeft.classList.remove('c-carousel__arrow--disabled')
            slide === slider.track.details.maxIdx
                ? arrowRight.classList.add('c-carousel__arrow--disabled')
                : arrowRight.classList.remove('c-carousel__arrow--disabled')
            Array.from(dots.children).forEach(function (dot, idx) {
                idx === slide
                    ? dot.classList.add('c-carousel__dot--active')
                    : dot.classList.remove('c-carousel__dot--active')
            })
        }

        slider.on('created', () => {
            markup()
            updateClasses()
        })
        slider.on('optionsChanged', () => {
            console.log(2)
            markup(true)
            markup()
            updateClasses()
        })
        slider.on('slideChanged', () => {
            updateClasses()
        })
        slider.on('destroyed', () => {
            markup(true)
        })
    }
    document.querySelectorAll('.js-carousel').forEach((element) => {
        const isDesktopOnly = element.hasAttribute('data-carousel-desktop-only');
        
        // Function to initialize carousel
        const initCarousel = () => {
            if (isDesktopOnly && window.innerWidth < 1024) {
                // If desktop-only and on mobile, remove carousel functionality
                if (element._slider) {
                    element._slider.destroy();
                    element._slider = null;
                }
                return;
            }
            
            // Initialize or reinitialize carousel
            if (!element._slider) {
                element._slider = new KeenSlider(element,
                    {
                        selector: '.js-carousel > *',
                        mode: 'snap',
                        slides: {
                            perView: 'auto',
                            spacing: 0
                        },
                        breakpoints: {
                            '(min-width: 1024px)': {
                                mode: 'snap',
                                slides: {
                                    perView: 'auto',
                                    spacing: 0
                                }
                            }
                        }
                    },
                    [navigation]
                );
            }
        };

        // Initial initialization
        initCarousel();

        // Handle window resize
        if (isDesktopOnly) {
            window.addEventListener('resize', initCarousel);
        }
    });
    document.querySelectorAll('.js-carousel-logos').forEach((element) => {
        var animation = { duration: 20000, easing: (t) => t }

        new KeenSlider(element,
            {
                selector: '.js-carousel-logos > *',
                mode: 'free',
                loop: true,
                drag: true,
                rtl: false,
                slides: { perView: 'auto' },
                created(s) {
                    s.moveToIdx(5, true, animation)
                },
                updated(s) {
                    s.moveToIdx(s.track.details.abs + 5, true, animation)
                },
                animationEnded(s) {
                    s.moveToIdx(s.track.details.abs + 5, true, animation)
                }
            }
        );
    });



    // PhotoSwipe
    var lightbox = new PhotoSwipeLightbox({
        gallery: '.js-lightbox-container',
        children: '.js-lightbox-object',

        closeTitle: 'Fechar',
        zoomTitle: 'Ampliar',
        arrowPrevTitle: 'Anterior',
        arrowNextTitle: 'Próximo',
        errorMsg: 'A imagem não pôde ser carregada',

        pswpModule: PhotoSwipe,
        loop: false,
        closeOnVerticalDrag: false,
        tapAction: false
    });

    // parse data-video-url attribute
    lightbox.addFilter('itemData', (itemData, index) => {
        const videoUrl = itemData.element.dataset.videoUrl;
        if (videoUrl) {
            itemData.videoUrl = videoUrl;
        }

        const modalId = itemData.element.dataset.modalId;
        if (modalId) {
            itemData.modalId = modalId;
        }

        return itemData;
    });

    // override slide content
    lightbox.on('contentLoad', (e) => {
        const { content } = e;

        const imgs = document.querySelectorAll('img');

        imgs.forEach(item => {
            item.setAttribute('oncontextmenu', 'return false\;');
        });

        if (content.type === 'video') {
            // prevent the default behavior
            e.preventDefault();

            // Create a container for iframe
            // and assign it to the `content.element` property
            content.element = document.createElement('div');
            content.element.className = 'pswp__video-container';

            const wrapper = document.createElement('div');
            wrapper.className = 'pswp__video-wrapper';
            content.element.appendChild(wrapper);

            const responsiveIframe = document.createElement('div');
            responsiveIframe.className = 'pswp__video-responsive-iframe';
            wrapper.appendChild(responsiveIframe);

            const iframe = document.createElement('iframe');
            iframe.setAttribute('allow', 'autoplay\; fullscreen');
            iframe.src = content.data.videoUrl;
            responsiveIframe.appendChild(iframe);
        } else if (content.type === 'modal') {
            // prevent the default behavior
            e.preventDefault();

            // Create a container for iframe
            // and assign it to the `content.element` property
            content.element = document.createElement('div');
            content.element.className = 'pswp__modal-container';

            const wrapper = document.createElement('div');
            wrapper.className = 'pswp__modal-wrapper';
            content.element.appendChild(wrapper);

            const modal = document.querySelector( content.data.modalId ).innerHTML;
            wrapper.innerHTML = modal;

            e.content.element.addEventListener('wheel', e => {
                e.stopPropagation();
            }, {
                capture: true
            });
        }
    });

    lightbox.init();



    // GSAP
    gsap.config({
        nullTargetWarn: false 
    });

    gsap.defaults({
        duration: 1
    });

    let mm = gsap.matchMedia();



    // ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.defaults({
        start: 'top bottom',
        toggleActions: 'play none none none'
    });

    /* loadImages */
    const loadImages = document.querySelectorAll('[data-st~="load-images"]');
    loadImages.forEach(item => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                onEnter: () => item.querySelectorAll('img').forEach(img => img.setAttribute('loading', 'eager'))
            }
        });
    });

    /* nav */
    const nav = document.querySelectorAll('[data-st~="nav"]');
    nav.forEach(item => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: 'body',
                start: 'top+=40 top',
                end: 'bottom top',
                endTrigger: 'html',
                toggleActions: 'play none none reverse',
                toggleClass: { className: 'c-nav--bg', targets: '[data-st="nav"]' }
            }
        });
    });

    /* parallax */
    const stParallax = document.querySelectorAll('[data-st~="parallax-container"]');
    stParallax.forEach(item => {
        var objects = item.querySelectorAll('[data-st~="parallax-object"]');

        objects.forEach(object => {
            var dirAttr = object.getAttribute('data-st-dir');
            var dirValue = 'to';
            if ( dirAttr && dirAttr === 'from' ) {
                dirValue = 'from';
            }
            
            var minWAttr = object.getAttribute('data-st-min-w');
            var minWValue = 0;
            if ( minWAttr && minWAttr === 'true' ) {
                minWValue = 1024;
            }

            var fadeAttr = object.getAttribute('data-st-fade');
            var fadeValue = 1;
            if ( fadeAttr && fadeAttr === 'true' ) {
                fadeValue = 0;
            }

            var scaleAttr = object.getAttribute('data-st-scale');
            var scaleValue = 1;
            if (scaleAttr) {
                scaleValue = scaleAttr;
            }

            var yAttr = object.getAttribute('data-st-y');
            var yValue = 200;
            if (yAttr) {
                yValue = yAttr;
            }

            var startAttr = object.getAttribute('data-st-start');
            var startValue = 'top bottom';
            if (startAttr) {
                startValue = startAttr;
            }
            
            var endAttr = object.getAttribute('data-st-end');
            var endValue = 'bottom top';
            if (endAttr) {
                endValue = endAttr;
            }
            
            var scrubAttr = object.getAttribute('data-st-scrub');
            var scrubValue = true;
            if (scrubAttr) {
                scrubValue = Number(scrubAttr);
            }

            mm.add('(min-width: ' + minWValue + 'px)', () => {
                if( dirValue === 'from' ) {
                    gsap.from(object, {
                        opacity: fadeValue,
                        scale: scaleValue,
                        y: yValue,
                        ease: 'none',
    
                        scrollTrigger: {
                            trigger: item,
                            duration: item,
                            start: startValue,
                            end: endValue,
                            scrub: scrubValue
                        }
                    });
                } else {
                    gsap.to(object, {
                        opacity: fadeValue,
                        scale: scaleValue,
                        y: yValue,
                        ease: 'none',
    
                        scrollTrigger: {
                            trigger: item,
                            duration: item,
                            start: startValue,
                            end: endValue,
                            scrub: scrubValue
                        }
                    });
                }
            });
        });
    });

    /* lineScrub */
    const stLineScrub = document.querySelectorAll('[data-st~="line-scrub-container"]');
    stLineScrub.forEach(item => {
        var objects = item.querySelectorAll('[data-st~="line-scrub-object"]');

        objects.forEach(object => {
            var offset = object.getTotalLength();

            gsap.to(object, {
                strokeDashoffset: offset,
                ease: 'none',

                scrollTrigger: {
                    trigger: item,
                    start: 'top top',
                    end: 'center top',
                    scrub: 2,
                }
            });
        });
    });

    /* scaleScrub */
    const stScaleScrub = document.querySelectorAll('[data-st~="scale-scrub-container"]');
    stScaleScrub.forEach(item => {
        var triggerAttr = item.querySelectorAll('[data-st~="scale-scrub-object"]');
        var triggerValue = item;
        if (triggerAttr) {
            triggerValue = triggerAttr;
        }

        gsap.from(triggerValue, {
            scale: 0.85,
            transformOrigin: 'top center',
            ease: 'none',

            scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: true,
            }
        });
    });

    /* textScrub */
    const stTextScrub = document.querySelectorAll('[data-st~="text-scrub-container"]');
    stTextScrub.forEach(item => {
        var objects = item.querySelectorAll('[data-st~="text-scrub-object"]');
        objects.forEach(object => {
            var startAttr = object.getAttribute('data-st-start');
            var startValue = 'top bottom';
            if (startAttr) {
                startValue = startAttr;
            }
            
            var endAttr = object.getAttribute('data-st-end');
            var endValue = 'bottom bottom';
            if (endAttr) {
                endValue = endAttr;
            }
            
            var startOffsetAttr = object.getAttribute('startOffset');
            var startOffsetValue = 0;
            if (startOffsetAttr) {
                startOffsetValue = Number(startOffsetAttr);
            }
            
            var endOffsetAttr = object.getAttribute('data-st-end-offset');
            var endOffsetValue = startOffsetValue + 160;
            if (endOffsetAttr) {
                endOffsetValue = Number(endOffsetAttr);
            }
            
            gsap.to(object, {
                attr: {
                    startOffset: endOffsetValue
                },
                ease: 'none',
    
                scrollTrigger: {
                    trigger: item,
                    start: startValue,
                    end: endValue,
                    scrub: 1,
                }
            });
        });
    });

    /* fadeContainer */
    const stFadeContainer = document.querySelectorAll('[data-st~="fade-container"]');
    stFadeContainer.forEach(item => {
        var triggerAttr = item.querySelectorAll('[data-st~="fade-object"]');
        var triggerValue = item;
        if (triggerAttr) {
            triggerValue = triggerAttr;
        }

        var startAttr = item.getAttribute('data-st-start');
        var startValue = null;
        if (startAttr) {
            startValue = startAttr;
        }

        gsap.from(triggerValue, {
            opacity: 0,
            stagger: 0.2,

            scrollTrigger: {
                trigger: item,
                start: startValue
            }
        });
    });

    /* fadeUpContainer */
    const stFadeUpContainer = document.querySelectorAll('[data-st~="fade-up-container"]');
    stFadeUpContainer.forEach(item => {
        var triggerAttr = item.querySelectorAll('[data-st~="fade-up-object"]');
        var triggerValue = item;
        if (triggerAttr) {
            triggerValue = triggerAttr;
        }

        var startAttr = item.getAttribute('data-st-start');
        var startValue = null;
        if (startAttr) {
            startValue = startAttr;
        }

        gsap.from(triggerValue, {
            opacity: 0,
            y: 40,
            stagger: 0.2,

            scrollTrigger: {
                trigger: item,
                start: startValue
            }
        });
    });

    /* fadeUpRightContainer */
    const stFadeRightContainer = document.querySelectorAll('[data-st~="fade-right-container"]');
    stFadeRightContainer.forEach(item => {
        var triggerAttr = item.querySelectorAll('[data-st~="fade-right-object"]');
        var triggerValue = item;
        if (triggerAttr) {
            triggerValue = triggerAttr;
        }

        var startAttr = item.getAttribute('data-st-start');
        var startValue = null;
        if (startAttr) {
            startValue = startAttr;
        }

        // Mobile animation
        mm.add('(max-width: 1023px)', () => {
            gsap.from(triggerValue, {
                opacity: 0,
                y: 40,
                stagger: 0.2,

                scrollTrigger: {
                    trigger: item,
                    start: startValue
                }
            });
        });

        // Desktop animation
        mm.add('(min-width: 1024px)', () => {
            gsap.from(triggerValue, {
                opacity: 0,
                x: -60,
                stagger: 0.2,

                scrollTrigger: {
                    trigger: item,
                    start: startValue
                }
            });
        });
    });

    /* springContainer */
    const stSpringContainer = document.querySelectorAll('[data-st~="spring-container"]');
    stSpringContainer.forEach(item => {
        var objects = item.querySelectorAll('[data-st~="spring-object"]');

        objects.forEach(object => {
            var scaleAttr = object.getAttribute('data-st-scale');
            var scaleValue = 0;
            if (scaleAttr) {
                scaleValue = Number(scaleAttr);
            }
    
            var xAttr = object.getAttribute('data-st-x');
            var xValue = '0px';
            if (xAttr) {
                xValue = xAttr;
            }

            var xLgAttr = object.getAttribute('data-st-x-lg');
            var xLgValue = xValue;
            if (xLgAttr) {
                xLgValue = xLgAttr;
            }
    
            var opacityAttr = object.getAttribute('data-st-opacity');
            var opacityValue = 1;
            if (opacityAttr) {
                opacityValue = Number(opacityAttr);
            }

            // Handle text visibility swap
            const visibleText = object.querySelector('[data-st="spring-text-visible"]');
            const hiddenText = object.querySelector('[data-st="spring-text-hidden"]');

            const swapTextVisibility = (fromText, toText) => {
                if (fromText && toText) {
                    fromText.classList.add('invisible');
                    toText.classList.remove('invisible');
                }
            };
    
            // Mobile animation
            mm.add('(max-width: 1023px)', () => {
                gsap.from(object, {
                    scaleX: scaleValue,
                    x: xValue,
                    opacity: opacityValue,
                    transformOrigin: 'left center',
                    duration: 1.2,
                    stagger: 0.2,
                    ease: 'elastic.out',
                    onStart: () => swapTextVisibility(visibleText, hiddenText),
                    onReverseComplete: () => swapTextVisibility(hiddenText, visibleText),
        
                    scrollTrigger: {
                        trigger: item,
                        start: 'bottom 66.66%',
                        toggleActions: 'play none none reverse',
                    }
                });
            });

            // Desktop animation
            mm.add('(min-width: 1024px)', () => {
                gsap.from(object, {
                    scaleX: scaleValue,
                    x: xLgValue,
                    opacity: opacityValue,
                    transformOrigin: 'left center',
                    duration: 1.2,
                    stagger: 0.2,
                    ease: 'elastic.out',
                    onStart: () => swapTextVisibility(visibleText, hiddenText),
                    onReverseComplete: () => swapTextVisibility(hiddenText, visibleText),
        
                    scrollTrigger: {
                        trigger: item,
                        start: 'bottom 66.66%',
                        toggleActions: 'play none none reverse',
                    }
                });
            });
        });
    });

    /* typeChars */
    const stTypeChars = document.querySelectorAll('[data-st~="type-chars"]');
    if (stTypeChars) {
      stTypeChars.forEach((item) => {
        const text = new SplitType(item, { types: "chars,words" });

        gsap.from(text.chars, {
            opacity: 0,
            y: "2em",
            ease: "power4.out",
            duration: 1,
            stagger: 0.02,
            
            scrollTrigger: {
                trigger: item,
            }
        });
      });
    }

    /* numbers */
    function formatNumber(number, decimalPlaces) {
        return parseFloat(number).toLocaleString('de-DE', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        });
    }
    const numbers = document.querySelectorAll('[data-st~="number"]');
    numbers.forEach(element => {
      let startValue = parseFloat(element.dataset.numberStart);
      let endValue = parseFloat(element.dataset.numberEnd);
      let decimalPlaces = (element.dataset.numberEnd.split('.')[1] || []).length;
  
      // GSAP animation
      gsap.fromTo(element, 
        { innerText: startValue }, 
        { 
          innerText: endValue, 
          duration: 3,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: element,
          },
          // Update the innerText of the element during the animation
          onUpdate: function() {
            element.innerText = formatNumber(this.targets()[0].innerText, decimalPlaces);
          }
        }
      );
    });

    /* fade */
    const stFade = document.querySelectorAll('[data-st~="fade"]')
    gsap.set(stFade, {
        opacity: 0
    });
    ScrollTrigger.batch(stFade, {
        batchMax: 16,
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            stagger: 0.2,
        })
    });

    /* fadeUp */
    const stFadeUp = document.querySelectorAll('[data-st~="fade-up"]');
    gsap.set(stFadeUp, {
        opacity: 0,
        y: 40
    });
    ScrollTrigger.batch(stFadeUp, {
        batchMax: 16,
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.2,
        })
    });
}
pageScripts();



// GSAP Anim
function gsapAnim(delay) {
    /* fade */
    gsap.from('[data-anim~="fade"]', {
        opacity: 0,
        duration: 1,
        delay: delay,
        stagger: 0.2,
    });
    
    /* fadeUp */
    gsap.from('[data-anim~="fade-up"]', {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: delay,
        stagger: 0.2,
    });
    
    /* skewUp */
    gsap.from('[data-anim~="skew-up"]', {
        opacity: 0,
        y: 40,
        skewY: 10,
        transformOrigin: 'top left',
        duration: 1,
        delay: delay,
        stagger: 0.2,
    });

    /* scale-down */
    gsap.from('[data-anim~="scale-down"]', {
        opacity: 0,
        scale: 1.3,
        duration: 4,
        delay: 0.2,
        stagger: 0.2,
        ease: 'power4.out',
    });

    /* typeChars */
    const typeChars = document.querySelectorAll('[data-anim~="type-chars"]');
    if (typeChars) {
      typeChars.forEach((item) => {
        const text = new SplitType(item, { types: "chars,words" });

        gsap.from(text.chars, {
            opacity: 0,
            y: "2em",
            ease: "power4.out",
            duration: 2,
            stagger: 0.02,
            delay: delay
        });
      });
    }

    /* line */
    const line = document.querySelectorAll('[data-anim~="line"]');
    line.forEach(item => {
        var offset = item.getTotalLength();
        
        gsap.from(item, {
            strokeDashoffset: offset,
            duration: 4,
            delay: delay,
            stagger: 0.2,
        });
    });

    /* bounce */
    gsap.from('[data-anim~="bounce"]', {
        y: -600,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.in',
    });

    /* textOffset */
    const textOffset = document.querySelectorAll('[data-anim~="text-offset"]');
    textOffset.forEach(item => {
        if( item.getAttribute('data-st-start-offset') ) {
            var startOffsetAttr = item.getAttribute('data-st-start-offset');
        } else {
            var startOffsetAttr = item.getAttribute('startOffset');
        }

        var startOffsetValue = 0;
        if (startOffsetAttr) {
            startOffsetValue = Number(startOffsetAttr);
        }
        
        gsap.from(item, {
            opacity: 0,
            attr: {
                startOffset: startOffsetValue - 160
            },
            duration: 2,
            ease: 'power4.out',
            delay: delay,
            stagger: 0.2,
        });
    });
}
gsapAnim(0.7);



// Lazy load videos
function lazyLoadVideos() {
    var lazyVideos = [].slice.call(document.querySelectorAll('.js-video-lazy-load'));

    if ('IntersectionObserver' in window) {
        var lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (video) {
                if (video.isIntersecting) {
                    for (var source in video.target.children) {
                        var videoSource = video.target.children[source];
                        if (typeof videoSource.tagName === 'string' && videoSource.tagName === 'SOURCE') {
                            videoSource.src = videoSource.dataset.src;
                        }
                    }

                    video.target.load();
                    video.target.classList.remove('js-video-lazy-load');
                    lazyVideoObserver.unobserve(video.target);
                }
            });
        });

        lazyVideos.forEach(function (lazyVideo) {
            lazyVideoObserver.observe(lazyVideo);
        });
    }
}
document.addEventListener('DOMContentLoaded', function () {
    lazyLoadVideos();
});



// Images loaded
document.addEventListener('DOMContentLoaded', function () {
    var img = document.querySelectorAll('main > *:first-child img')[0];
    if( document.querySelectorAll('.c-loader')[0] ) {
        if( img && !img.complete ) {
            img.addEventListener('load', () => {
                document.querySelectorAll('.c-loader')[0].classList.add('c-loader--hidden');
            });
            img.addEventListener('error', () => {
                document.querySelectorAll('.c-loader')[0].classList.add('c-loader--hidden');
            });
        } else {
            document.querySelectorAll('.c-loader')[0].classList.add('c-loader--hidden');
        }
    }
});



// Lenis
const lenis = new Lenis();

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);



// Barba.js
barba.hooks.enter(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
    ScrollTrigger.update();
    pageScripts();
    gsapAnim(0.3);
    lazyLoadVideos();

    // Contact Form
    var cf_selector = 'div.wpcf7 > form';
    if (cf_selector.length > 0) {
        document.querySelectorAll(cf_selector).forEach((element) => {
            wpcf7.init(element);
        });
    }

    // Scroll to
    if(window.location.hash) {
        if(window.matchMedia('(min-width: 1024px)').matches) {
            var offset = document.querySelector(window.location.hash).offsetLeft;
        } else {
            var offset = document.querySelector(window.location.hash).offsetTop;
        }
        
        lenis.scrollTo(offset, { offset: -80, duration: 1, delay: 2 });
    }
});
barba.init({
    preventRunning: true,
    debug: true,

    transitions: [
        {
            name: 'opacity',

            async leave(data) {
                await gsap.to(data.current.container, {
                    opacity: 0,
                    duration: 0.3
                });

                data.current.container.remove()
            },

            async enter(data) {
                await gsap.from(data.next.container, {
                    opacity: 0,
                    duration: 0.3
                });
            }
        }
    ]
});
