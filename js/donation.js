(() => {
    const modal = document.getElementById('donation-modal');
    const form = document.getElementById('donation-form');
    const errorElement = document.getElementById('donation-error');

    if (!modal || !form) return;

    window.openDonationModal = function(amount) {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (amount) document.getElementById('donation-amount').value = amount;
        document.getElementById('donation-amount')?.focus();
    };

    window.closeDonationModal = function() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-scroll-target]').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    document.querySelector('.challenge-hero-btn')?.addEventListener('click', event => {
        event.preventDefault();
        document.getElementById('donation-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.querySelector('.donation-open-button')?.addEventListener('click', () => window.openDonationModal());
    document.querySelectorAll('[data-quick-amount]').forEach(button => {
        button.addEventListener('click', () => window.openDonationModal(Number(button.dataset.quickAmount)));
    });

    document.querySelectorAll('.donation-nav-link').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            window.openDonationModal();
        });
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) window.closeDonationModal();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        errorElement.textContent = '';

        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const amount = Number(formData.get('amount'));
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const phone = String(formData.get('phone') || '').replace(/\D/g, '');

        if (!Number.isInteger(amount) || amount < 1 || amount > 1000000) {
            errorElement.textContent = 'Please enter an amount between ₹1 and ₹10,00,000.';
            return;
        }
        if (!name || !email || phone.length < 10) {
            errorElement.textContent = 'Please enter valid name, email, and phone details.';
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Opening payment...';

        try {
            const orderResponse = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    name,
                    sourceWebsite: window.location.origin,
                    sourcePage: window.location.href
                })
            });
            const order = await orderResponse.json();
            if (!orderResponse.ok) throw new Error(order.error || 'Unable to create payment order.');
            if (typeof Razorpay === 'undefined') throw new Error('Payment gateway failed to load.');

            const checkout = new Razorpay({
                key: order.key,
                order_id: order.orderId,
                amount: order.amount,
                currency: 'INR',
                name: 'SharmBazaar',
                description: 'Leaderboard donation',
                prefill: { name, email, contact: phone },
                theme: { color: '#d91e27' },
                handler: async response => {
                    try {
                        const verifyResponse = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...response,
                                name,
                                email,
                                phone,
                                sourceWebsite: window.location.origin,
                                sourcePage: window.location.href
                            })
                        });
                        const result = await verifyResponse.json();
                        if (!verifyResponse.ok || !result.success) throw new Error(result.error || 'Payment verification failed.');
                        window.closeDonationModal();
                        form.reset();
                        alert('Donation received. Thank you!');
                        window.loadLeaderboardData?.();
                    } catch (error) {
                        errorElement.textContent = error.message;
                    }
                }
            });
            checkout.on('payment.failed', () => {
                errorElement.textContent = 'Payment was not completed. Please try again.';
            });
            checkout.open();
        } catch (error) {
            errorElement.textContent = error.message;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Continue to payment';
        }
    });
})();