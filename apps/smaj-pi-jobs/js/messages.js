// SMAJ PI JOBS - Messages Module

// Conversations Data
const conversationsData = [
    {
        id: 0,
        user: 'TechStore Inc.',
        initial: 'T',
        gradient: 'var(--gradient-primary)',
        lastMessage: 'Sure, I can have that ready by tomorrow!',
        time: '2m ago',
        unread: 2,
        online: true,
        messages: [
            { sender: 'client', text: 'Hi! I wanted to discuss the project timeline for the e-commerce website.', time: '10:30 AM' },
            { sender: 'me', text: 'Sure! I\'m currently working on the home page. The product catalog should be done by tomorrow.', time: '10:32 AM' },
            { sender: 'client', text: 'That\'s great progress! Can you also include the shopping cart functionality?', time: '10:35 AM' },
            { sender: 'me', text: 'Absolutely! I\'ve already started on the cart logic. Should be ready soon.', time: '10:38 AM' },
            { sender: 'client', text: 'Sure, I can have that ready by tomorrow!', time: '2m ago' }
        ]
    },
    {
        id: 1,
        user: 'FitLife App',
        initial: 'F',
        gradient: 'var(--gradient-secondary)',
        lastMessage: 'Looking forward to seeing the mockups!',
        time: '1h ago',
        unread: 0,
        online: true,
        messages: [
            { sender: 'client', text: 'Hi! Are the mockups ready?', time: '9:00 AM' },
            { sender: 'me', text: 'Almost done! Just adding the final touches.', time: '9:15 AM' },
            { sender: 'client', text: 'Looking forward to seeing the mockups!', time: '1h ago' }
        ]
    },
    {
        id: 2,
        user: 'DataDriven Co.',
        initial: 'D',
        gradient: 'linear-gradient(135deg, #FDCB6E, #F39C12)',
