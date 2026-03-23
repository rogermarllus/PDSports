// máscara telefone
const inputPhone = document.getElementById('input-phone');

inputPhone.addEventListener("input", (e) => {
    let value = e.target.value;

    let number = value.replace(/\D/g, '');

    let result = '';

    if (number.length > 0) {
        result = '(' + number.substring(0, 2);

        if (number.length > 2) {
            result += ') ' + number.substring(2, 7);

            if (number.length > 7) {
                result += '-' + number.substring(7, 11);
            }
        }
    }

    e.target.value = result;
})