const multiplication_factor = {};

document.querySelectorAll('.edit').forEach((button) => {
    const row = button.closest('tr');
    const numberPlate = row.querySelector('th').textContent.trim();
    const inputs = row.querySelectorAll('input');

    // Dynamically create an object for each input field in the row
    multiplication_factor[numberPlate] = Array.from(inputs).reduce((acc, input) => {
        acc[input.name] = input.value; // Use input's name attribute as the key
        return acc;
    }, {});
});

// Toggle edit mode and check for changes
document.querySelectorAll('.edit').forEach((button) => {
    button.addEventListener('click', async function () {
        this.textContent = this.textContent === 'Done' ? 'Edit' : 'Done';
        const row = this.closest('tr');
        const inputs = row.querySelectorAll('input');
        const numberPlate = row.querySelector('th').textContent.trim();
        inputs.forEach(input => input.disabled = !input.disabled);
        if (!inputs[0].disabled) inputs[0].focus();

        if (this.textContent === 'Edit') {
            const currentValues = Array.from(inputs).reduce((acc, input) => {
                acc[input.name] = input.value;
                return acc;
            }, {});

            // Check if any values have changed
            const hasChanged = Object.keys(currentValues).some(key => currentValues[key] !== multiplication_factor[numberPlate][key]);
            if (hasChanged) {
                multiplication_factor[numberPlate] = currentValues;
                const object = {
                    number_plate: numberPlate,
                    columns: multiplication_factor[numberPlate]
                }
                const response = await fetch('/admin/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(object)
                });
                if (!response.ok) console.error("Error posting data:", response.status)
            }
        }
    });
});
