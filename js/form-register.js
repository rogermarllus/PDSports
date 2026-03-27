// Validação dos formulários

const form = document.getElementById("form");

function sectionActive() {
    const desktopSection = document.querySelector('#section-input');
    const mobileSection = document.querySelector('#section-input-mobile');

    if (desktopSection && window.getComputedStyle(desktopSection).display !== 'none') {
        return desktopSection;
    }
    if (mobileSection && window.getComputedStyle(mobileSection).display !== 'none') {
        return mobileSection;
    }

    return null;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const getSectionActive = sectionActive();

    const fieldsInput = [
        {
            className: 'input-name',
            Validator: nameIsValid
        },
        {
            className: 'input-email',
            Validator: emailIsValid
        },
        {
            className: 'input-phone',
            Validator: telIsValid
        },
        {
            className: 'input-date-of-birth',
            Validator: dateIsValid
        },
        {
            className: 'input-password',
            Validator: passwordIsSafe
        },
        {
            className: 'input-confirm-password',
            Validator: passwordIsMatch
        },
    ]

    const errorIcon = '<i class="fa-solid fa-circle-exclamation"></i>';

    fieldsInput.forEach(field => {
        console.log(getSectionActive)
        const input = getSectionActive.querySelector(`.${fieldsInput.className}`);
        const containInput = input.closest('.container-input');
        const inputValue = input.value;
        const errorSpan = containInput.querySelector('.error');
        errorSpan.innerHTML = '';

        containInput.classList.remove('valid');
        input.classList.remove('valid');
        containInput.classList.add('valid');
        input.classList.add('valid');

        const fieldValidator = field.Validator(inputValue);

        if (!fieldValidator.isValid) {
            errorSpan.innerHTML = `${errorIcon} ${fieldValidator.errorMessage}`;
            containInput.classList.add('invalid');
            input.classList.add('invalid');
            containInput.classList.remove('valid');
            input.classList.remove('valid');
            return;
        }
    })
});

function isEmpty(value) {
    return value === '';
}

function nameIsValid(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    }

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = `Preencha o campo obrigatório`;
        return validator;
    }

    const minValue = 3;

    if (value.length < minValue) {
        validator.isValid = false;
        validator.errorMessage = `O nome deve ter no mínimo ${minValue} caracteres`;
        return validator
    }

    const regex = /^[a-zA-Z]/;
    if (!regex.test(value)) {
        validator.isValid = false;
        validator.errorMessage = `Deve conter apenas letras`;
    }

    return validator;
}

function emailIsValid(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    }

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = `Preencha o campo obrigatório`;
        return validator;
    }

    const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");

    if (!regex.test(value)) {
        validator.isValid = false;
        validator.errorMessage = `Email inválido`;
        return validator;
    }

    return validator;
}

function telIsValid(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    }

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = `Preencha o campo obrigatório`;
        return validator;
    }

    const regex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

    if (!regex.test(value)) {
        validator.isValid = false;
        validator.errorMessage = `Telefone inválido`;
        return validator;
    }

    return validator
}

function dateIsValid(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    }

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = `Preencha o campo obrigatório`;
        return validator;
    }

    const yearData = new Date(value).getFullYear();

    if (yearData < 1903 || yearData > new Date().getFullYear()) {
        validator.isValid = false;
        validator.errorMessage = `Data inválida`;
        return validator;
    }

    if (yearData > (new Date().getFullYear() - 18)) {
        validator.isValid = false;
        validator.errorMessage = `Você é menor de idade`;
        return validator;
    }

    return validator;
}


function passwordIsSafe(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    }

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = `Preencha o campo obrigatório`;
        return validator;
    }

    const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

    if (!regex.test(value)) {
        validator.isValid = false;
        validator.errorMessage = `Senha inválida`;
        return validator;
    }

    return validator;
}

function passwordIsMatch(value) {
    const getSectionActive = sectionActive();

    const validator = {
        isValid: true,
        errorMessage: null
    }

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = `Preencha o campo obrigatório`;
        return validator;
    }

    const passwordValue = getSectionActive.querySelector('.input-password');
    const passwordValueInput = passwordValue.value;

    const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

    if (!regex.test(value)) {
        validator.isValid = false;
        validator.errorMessage = `Senha inválida não correspondida`;
        return validator;
    }

    if (value === '' || passwordValueInput !== value) {
        validator.isValid = false;
        validator.errorMessage = `Senha não correspondente`;
        return validator;
    }

    return validator;
}
// máscara telefone
const getSectionActive = sectionActive();

const inputPhone = getSectionActive.querySelector('.input-phone');

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
});

// Funcionalidade para esconder e aparecer o ícone de olho

const passwordIcons = document.querySelectorAll('.password-icon');

passwordIcons.forEach(icon => {
    icon.addEventListener('click', function () {
        const containerPassword = this.closest('#container-input-password');
        const input = containerPassword.querySelector('input');
        console.log(containerPassword)

        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        } else {
            input.type = 'password';
            this.classList.add('fa-eye-slash');
            this.classList.remove('fa-eye');
        }
    });
});