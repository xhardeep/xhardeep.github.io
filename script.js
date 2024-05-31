document.addEventListener('DOMContentLoaded', function() {
    const display = document.getElementById('display');
    const buttons = Array.from(document.getElementsByClassName('btn'));

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.id === 'clear') {
                display.textContent = '0';
            } else if (button.id === 'equals') {
                try {
                    display.textContent = eval(display.textContent);
                } catch {
                    display.textContent = 'Error';
                }
            } else {
                if (display.textContent === '0') {
                    display.textContent = button.textContent;
                } else {
                    display.textContent += button.textContent;
                }
            }
        });
    });
});
