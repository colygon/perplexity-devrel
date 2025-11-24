// Presentation Controller
class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 18;
        this.slides = document.querySelectorAll('.slide');
        this.progressFill = document.getElementById('progressFill');
        this.currentSlideEl = document.getElementById('currentSlide');
        this.totalSlidesEl = document.getElementById('totalSlides');
        this.prevBtn = document.getElementById('prevSlide');
        this.nextBtn = document.getElementById('nextSlide');

        this.init();
    }

    init() {
        // Set total slides
        this.totalSlidesEl.textContent = this.totalSlides;

        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });

        // Initialize first slide
        this.showSlide(1);

        // Add code highlighting if Prism is available
        this.highlightCode();
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.previousSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case 'Escape':
                this.exitFullscreen();
                break;
            case 'Home':
                this.showSlide(1);
                break;
            case 'End':
                this.showSlide(this.totalSlides);
                break;
            default:
                // Check for number keys
                if (e.key >= '1' && e.key <= '9') {
                    const slideNum = parseInt(e.key);
                    if (slideNum <= this.totalSlides) {
                        this.showSlide(slideNum);
                    }
                }
        }
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;

        if (endX < startX - swipeThreshold) {
            // Swipe left - next slide
            this.nextSlide();
        } else if (endX > startX + swipeThreshold) {
            // Swipe right - previous slide
            this.previousSlide();
        }
    }

    showSlide(n) {
        // Boundary checks
        if (n > this.totalSlides) {
            this.currentSlide = this.totalSlides;
        } else if (n < 1) {
            this.currentSlide = 1;
        } else {
            this.currentSlide = n;
        }

        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Show current slide
        const currentSlideEl = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        if (currentSlideEl) {
            currentSlideEl.classList.add('active');

            // Add animation class
            currentSlideEl.classList.add('fade-in');
            setTimeout(() => {
                currentSlideEl.classList.remove('fade-in');
            }, 500);
        }

        // Update UI
        this.updateUI();

        // Update URL hash for bookmarking
        window.location.hash = `slide-${this.currentSlide}`;
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.showSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.showSlide(this.currentSlide - 1);
        }
    }

    updateUI() {
        // Update slide counter
        this.currentSlideEl.textContent = this.currentSlide;

        // Update progress bar
        const progress = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;

        // Update button states
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;

        // Update document title
        document.title = `Perplexity API - Slide ${this.currentSlide}/${this.totalSlides}`;
    }

    toggleFullscreen() {
        const container = document.querySelector('.presentation-container');

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            container.classList.add('fullscreen');
        } else {
            document.exitFullscreen();
            container.classList.remove('fullscreen');
        }
    }

    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            document.querySelector('.presentation-container').classList.remove('fullscreen');
        }
    }

    highlightCode() {
        // Add syntax highlighting for code blocks
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            // Simple syntax highlighting
            let html = block.innerHTML;

            // Python/JavaScript keywords
            const keywords = ['import', 'from', 'class', 'def', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'True', 'False', 'None', 'null'];
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                html = html.replace(regex, `<span style="color: #ff79c6">${keyword}</span>`);
            });

            // Strings
            html = html.replace(/"([^"]*)"/g, '<span style="color: #f1fa8c">"$1"</span>');
            html = html.replace(/'([^']*)'/g, '<span style="color: #f1fa8c">\'$1\'</span>');

            // Comments
            html = html.replace(/(#.*$)/gm, '<span style="color: #6272a4">$1</span>');
            html = html.replace(/(\/\/.*$)/gm, '<span style="color: #6272a4">$1</span>');

            // Numbers
            html = html.replace(/\b(\d+)\b/g, '<span style="color: #bd93f9">$1</span>');

            block.innerHTML = html;
        });
    }
}

// Auto-advance timer (optional)
class AutoAdvance {
    constructor(presentation) {
        this.presentation = presentation;
        this.interval = null;
        this.duration = 15000; // 15 seconds per slide
        this.enabled = false;
    }

    start() {
        this.enabled = true;
        this.interval = setInterval(() => {
            if (this.presentation.currentSlide < this.presentation.totalSlides) {
                this.presentation.nextSlide();
            } else {
                this.stop();
            }
        }, this.duration);
    }

    stop() {
        this.enabled = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    toggle() {
        if (this.enabled) {
            this.stop();
        } else {
            this.start();
        }
    }
}

// Slide Timer
class SlideTimer {
    constructor() {
        this.startTime = Date.now();
        this.times = [];
        this.currentSlideStart = Date.now();
    }

    recordSlideTime(slideNumber) {
        const duration = Date.now() - this.currentSlideStart;
        this.times[slideNumber] = duration;
        this.currentSlideStart = Date.now();
    }

    getTotalTime() {
        return Date.now() - this.startTime;
    }

    getFormattedTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new PresentationController();
    const autoAdvance = new AutoAdvance(presentation);
    const timer = new SlideTimer();

    // Check for hash in URL
    const hash = window.location.hash;
    if (hash) {
        const slideNum = parseInt(hash.replace('#slide-', ''));
        if (slideNum && slideNum <= presentation.totalSlides) {
            presentation.showSlide(slideNum);
        }
    }

    // Add presentation controls info
    console.log('%c🎯 Perplexity API Presentation Controls', 'color: #6B46C1; font-size: 16px; font-weight: bold');
    console.log('%cKeyboard Shortcuts:', 'color: #8B66E1; font-weight: bold');
    console.log('→ / ← : Navigate slides');
    console.log('F : Toggle fullscreen');
    console.log('ESC : Exit fullscreen');
    console.log('Home/End : First/Last slide');
    console.log('1-9 : Jump to slide');

    // Add timer display option
    const addTimerDisplay = () => {
        const timerDiv = document.createElement('div');
        timerDiv.style.position = 'fixed';
        timerDiv.style.top = '10px';
        timerDiv.style.right = '10px';
        timerDiv.style.padding = '10px';
        timerDiv.style.background = 'rgba(30, 35, 60, 0.9)';
        timerDiv.style.borderRadius = '8px';
        timerDiv.style.color = '#a0a9c9';
        timerDiv.style.fontSize = '14px';
        timerDiv.style.display = 'none';
        timerDiv.id = 'presentationTimer';
        document.body.appendChild(timerDiv);

        setInterval(() => {
            if (timerDiv.style.display !== 'none') {
                timerDiv.textContent = `Time: ${timer.getFormattedTime(timer.getTotalTime())}`;
            }
        }, 1000);
    };

    // Toggle timer with 'T' key
    document.addEventListener('keydown', (e) => {
        if (e.key === 't' || e.key === 'T') {
            const timerDiv = document.getElementById('presentationTimer');
            if (timerDiv) {
                timerDiv.style.display = timerDiv.style.display === 'none' ? 'block' : 'none';
            } else {
                addTimerDisplay();
                document.getElementById('presentationTimer').style.display = 'block';
            }
        }

        // Toggle auto-advance with 'A' key
        if (e.key === 'a' || e.key === 'A') {
            autoAdvance.toggle();
            console.log(autoAdvance.enabled ? 'Auto-advance enabled' : 'Auto-advance disabled');
        }
    });
});

// Smooth scroll for any internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Export presentation object for external control
window.PerplexityPresentation = {
    next: () => window.presentationController?.nextSlide(),
    previous: () => window.presentationController?.previousSlide(),
    goTo: (n) => window.presentationController?.showSlide(n),
    fullscreen: () => window.presentationController?.toggleFullscreen()
};