// Validação dos formulários

const form = document.getElementById("form");

function sectionActive() {
    const desktopSection = document.querySelector('#section-input');
    const mobileSection = document.querySelector('#section-input-mobile');
    const cardLogin = document.querySelector('#card-login');

    if (desktopSection && window.getComputedStyle(desktopSection).display !== 'none') {
        return desktopSection;
    }
    if (mobileSection && window.getComputedStyle(mobileSection).display !== 'none') {
        return mobileSection;
    }
    if (cardLogin && window.getComputedStyle(cardLogin).display !== 'none') {
        return cardLogin;
    }

    return null;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const getSectionActive = sectionActive();

    const fieldsInput = [
        {
            className: 'input-email',
            Validator: emailIsValid
        },
        {
            className: 'input-password',
            Validator: passwordIsSafe
        },
    ]

    const errorIcon = '<i class="fa-solid fa-circle-exclamation"></i>';

    fieldsInput.forEach(field => {
        const input = getSectionActive.querySelector(`.${fieldsInputLogin.className}`);
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