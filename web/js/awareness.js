document.addEventListener('DOMContentLoaded', () => {
    // Accordion Logic
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(acc => {
        acc.addEventListener('click', () => {
            const content = acc.nextElementSibling;
            const icon = acc.querySelector('.accordion-icon');
            
            // Toggle current
            content.classList.toggle('hidden');
            
            // Rotate icon
            if (content.classList.contains('hidden')) {
                icon.style.transform = 'rotate(0deg)';
            } else {
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Quiz Logic
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Reset siblings
            const parent = this.parentElement;
            parent.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('bg-green-500/20', 'border-green-500', 'bg-red-500/20', 'border-red-500');
                opt.classList.add('bg-white/5', 'border-white/10');
            });

            // Check answer
            const isCorrect = this.dataset.correct === 'true';
            
            this.classList.remove('bg-white/5', 'border-white/10');
            if (isCorrect) {
                this.classList.add('bg-green-500/20', 'border-green-500');
                // Show explanation if exists
                const explanation = parent.nextElementSibling;
                if (explanation && explanation.classList.contains('quiz-explanation')) {
                    explanation.classList.remove('hidden');
                    explanation.textContent = "Correct! " + explanation.dataset.text;
                    explanation.classList.add('text-green-400');
                }
            } else {
                this.classList.add('bg-red-500/20', 'border-red-500');
                const explanation = parent.nextElementSibling;
                if (explanation && explanation.classList.contains('quiz-explanation')) {
                    explanation.classList.remove('hidden');
                    explanation.textContent = "Incorrect. Try again.";
                    explanation.classList.add('text-red-400');
                }
            }
        });
    });
});
