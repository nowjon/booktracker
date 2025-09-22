// Dark Mode functionality
function toggleDarkMode() {
    const html = document.documentElement;
    const body = document.body;
    const toggleButton = document.getElementById('darkModeToggle');
    const toggleIcon = document.querySelector('.toggle-icon');
    const currentTheme = html.getAttribute('data-bs-theme') || 'light';
    
    console.log('Current theme:', currentTheme); // Debug log
    
    if (currentTheme === 'dark') {
        // Switch to light mode
        html.setAttribute('data-bs-theme', 'light');
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        toggleButton.classList.remove('active');
        if (toggleIcon) {
            toggleIcon.textContent = 'dark_mode';
        }
        localStorage.setItem('theme', 'light');
        console.log('Switched to light mode'); // Debug log
    } else {
        // Switch to dark mode
        html.setAttribute('data-bs-theme', 'dark');
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        toggleButton.classList.add('active');
        if (toggleIcon) {
            toggleIcon.textContent = 'light_mode';
        }
        localStorage.setItem('theme', 'dark');
        console.log('Switched to dark mode'); // Debug log
    }
}

// Initialize dark mode on page load
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    const body = document.body;
    const toggleButton = document.getElementById('darkModeToggle');
    const toggleIcon = document.querySelector('.toggle-icon');
    
    console.log('Initializing with theme:', savedTheme); // Debug log
    
    if (savedTheme === 'dark') {
        html.setAttribute('data-bs-theme', 'dark');
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        if (toggleButton) {
            toggleButton.classList.add('active');
        }
        if (toggleIcon) {
            toggleIcon.textContent = 'light_mode';
        }
    } else {
        html.setAttribute('data-bs-theme', 'light');
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        if (toggleButton) {
            toggleButton.classList.remove('active');
        }
        if (toggleIcon) {
            toggleIcon.textContent = 'dark_mode';
        }
    }
}

// Initialize dark mode when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dark mode'); // Debug log
    initializeDarkMode();
});

// Also initialize immediately in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDarkMode);
} else {
    initializeDarkMode();
}
