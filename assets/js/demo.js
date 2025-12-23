function replayDemoAnimation() {
    const fbContent = document.getElementById('fb-content');
    if (!fbContent) return;
    
    const lines = fbContent.querySelectorAll('.line');
    
    // Reset animations
    lines.forEach(line => {
        line.style.animation = 'none';
        line.offsetHeight; // Trigger reflow
        line.style.animation = '';
    });

    // Reset progress ring
    const progress = document.querySelector('.progress-ring .progress');
    if (progress) {
        progress.style.animation = 'none';
        progress.offsetHeight;
        progress.style.animation = '';
    }
}

// Optional: Replay animation when section comes into view
if ('IntersectionObserver' in window) {
    const demoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                replayDemoAnimation();
            }
        });
    }, { threshold: 0.3 });

    const demoSection = document.querySelector('.automation-demo-section');
    if (demoSection) {
        demoObserver.observe(demoSection);
    }
}