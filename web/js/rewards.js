document.addEventListener('DOMContentLoaded', () => {
    const claimForm = document.getElementById('claim-form');
    const successMessage = document.getElementById('claim-success');
    
    if (claimForm) {
        claimForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulate API call / Processing
            const btn = claimForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            
            btn.disabled = true;
            btn.innerText = 'Processing...';
            
            setTimeout(() => {
                // Hide form, show success
                claimForm.classList.add('hidden');
                successMessage.classList.remove('hidden');
                
                // Confetti effect could go here
                
                // Save to local storage (simulation)
                const email = document.getElementById('reward-email').value;
                localStorage.setItem('zerotrace_reward_claim', JSON.stringify({
                    email: email,
                    date: new Date().toISOString(),
                    status: 'pending'
                }));
                
            }, 1500);
        });
    }
});
