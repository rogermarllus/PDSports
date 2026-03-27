const ERROR_ICON = `<svg class="fv-icon-alert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const SUCCESS_ICON = `<svg class="fv-icon-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function isEmpty(value) {
  return value.trim() === "";
}

function makeResult(isValid = true, errorMessage = null) {
  return { isValid, errorMessage };
}

function applyFeedback(input, container, errorSpan, result) {
  input.classList.remove("fv-valid", "fv-invalid");
  container.classList.remove("fv-valid", "fv-invalid");
  errorSpan.innerHTML = "";

  if (result.isValid) {
    input.classList.add("fv-valid");
    container.classList.add("fv-valid");
  } else {
    input.classList.add("fv-invalid");
    container.classList.add("fv-invalid");
    errorSpan.innerHTML = `${ERROR_ICON} ${result.errorMessage}`;
  }
}

function validateFields(scope, fieldDefs) {
  let allValid = true;

  fieldDefs.forEach(({ selector, validator, optional }) => {
    const input = scope.querySelector(selector);
    if (!input) return;

    const container = input.closest(".container-input") || input.parentElement;
    const errorSpan = container.querySelector(".error") || container.querySelector(".fv-error");
    if (!errorSpan) return;

    const value = input.value;

    if (optional && isEmpty(value)) {
      applyFeedback(input, container, errorSpan, makeResult(true));
      return;
    }

    const result = validator(value);
    applyFeedback(input, container, errorSpan, result);

    if (!result.isValid) allValid = false;
  });

  return allValid;
}

export const validators = {
  required(value, label = "campo") {
    if (isEmpty(value)) return makeResult(false, `Preencha o ${label} obrigatório`);
    return makeResult();
  },

  name(value) {
    if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
    if (value.trim().length < 3) return makeResult(false, "O nome deve ter no mínimo 3 caracteres");
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return makeResult(false, "Deve conter apenas letras");
    return makeResult();
  },

  email(value) {
    if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
      return makeResult(false, "E-mail inválido");
    return makeResult();
  },

  phone(value) {
    if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
    if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(value)) return makeResult(false, "Telefone inválido");
    return makeResult();
  },

  dateOfBirth(value) {
    if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
    const year = new Date(value).getFullYear();
    const currentYear = new Date().getFullYear();
    if (year < 1903 || year > currentYear) return makeResult(false, "Data inválida");
    if (year > currentYear - 18) return makeResult(false, "Você é menor de idade");
    return makeResult();
  },

  password(value) {
    if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
    if (value.length < 8) return makeResult(false, "A senha deve ter no mínimo 8 caracteres");
    return makeResult();
  },

  confirmPassword(value, getPasswordValue) {
    if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
    if (value.length < 8) return makeResult(false, "A senha deve ter no mínimo 8 caracteres");
    const passwordValue = typeof getPasswordValue === "function" ? getPasswordValue() : null;
    if (passwordValue !== null && value !== passwordValue)
      return makeResult(false, "Senhas não coincidem");
    return makeResult();
  },

  minLength(min = 3) {
    return function (value) {
      if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
      if (value.trim().length < min) return makeResult(false, `Mínimo de ${min} caracteres`);
      return makeResult();
    };
  },

  positiveNumber(value) {
    if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
    const n = parseFloat(value);
    if (isNaN(n) || n < 0) return makeResult(false, "Insira um número válido");
    return makeResult();
  },

  imageUrl(value) {
    if (isEmpty(value)) return makeResult(false, "Preencha o campo obrigatório");
    if (!/^(https?:\/\/.+|\/[^\s]+)/.test(value))
      return makeResult(false, "URL de imagem inválida");
    return makeResult();
  },

  newsletterEmail(value) {
    if (isEmpty(value)) return makeResult(false, "Informe seu e-mail");
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
      return makeResult(false, "E-mail inválido");
    return makeResult();
  },
};

export function initPasswordToggle() {
  document.querySelectorAll(".password-icon").forEach((icon) => {
    icon.addEventListener("click", function () {
      const wrapper = this.closest("#container-input-password");
      if (!wrapper) return;
      const input = wrapper.querySelector("input");
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      this.classList.toggle("fa-eye-slash", !isHidden);
      this.classList.toggle("fa-eye", isHidden);
    });
  });
}

export function initPhoneMask(input) {
  if (!input) return;
  input.addEventListener("input", (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    let result = "";
    if (digits.length > 0) {
      result = "(" + digits.substring(0, 2);
      if (digits.length > 2) {
        result += ") " + digits.substring(2, 7);
        if (digits.length > 7) result += "-" + digits.substring(7, 11);
      }
    }
    e.target.value = result;
  });
}

export function initLoginForm(onValid) {
  const form = document.getElementById("form-login");
  if (!form) return;

  const scope = document.getElementById("card-login") || form;

  const fieldDefs = [
    { selector: ".input-email", validator: validators.email },
    { selector: ".input-password", validator: validators.password },
  ];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const valid = validateFields(scope, fieldDefs);
    if (valid && typeof onValid === "function") {
      const email = scope.querySelector(".input-email").value.trim();
      const password = scope.querySelector(".input-password").value.trim();
      onValid({ email, password });
    }
  });

  fieldDefs.forEach(({ selector, validator }) => {
    const input = scope.querySelector(selector);
    if (!input) return;
    input.addEventListener("blur", () => {
      const container = input.closest(".container-input") || input.parentElement;
      const errorSpan = container.querySelector(".error") || container.querySelector(".fv-error");
      if (errorSpan) applyFeedback(input, container, errorSpan, validator(input.value));
    });
  });

  initPasswordToggle();
}

export function initRegisterForm(onValid) {
  const form = document.getElementById("form-register");
  if (!form) return;

  function getActiveScope() {
    const desktop = document.querySelector("#section-input");
    const mobile = document.querySelector("#section-input-mobile");
    if (desktop && window.getComputedStyle(desktop).display !== "none") return desktop;
    if (mobile && window.getComputedStyle(mobile).display !== "none") return mobile;
    return form;
  }

  function buildFieldDefs(scope) {
    const passwordInput = scope.querySelector(".input-password");
    return [
      { selector: ".input-name", validator: validators.name },
      { selector: ".input-email", validator: validators.email },
      { selector: ".input-phone", validator: validators.phone },
      { selector: ".input-date-of-birth", validator: validators.dateOfBirth },
      { selector: ".input-password", validator: validators.password },
      {
        selector: ".input-confirm-password",
        validator: (v) =>
          validators.confirmPassword(v, () => (passwordInput ? passwordInput.value : null)),
      },
    ];
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const scope = getActiveScope();
    const valid = validateFields(scope, buildFieldDefs(scope));

    if (valid && typeof onValid === "function") {
      onValid({
        name: scope.querySelector(".input-name").value.trim(),
        email: scope.querySelector(".input-email").value.trim(),
        phone: scope.querySelector(".input-phone").value.trim(),
        birthDate: scope.querySelector(".input-date-of-birth").value,
        password: scope.querySelector(".input-password").value.trim(),
      });
    }
  });

  ["#section-input", "#section-input-mobile"].forEach((id) => {
    const sec = document.querySelector(id);
    if (!sec) return;
    const defs = buildFieldDefs(sec);
    defs.forEach(({ selector, validator }) => {
      const input = sec.querySelector(selector);
      if (!input) return;
      input.addEventListener("blur", () => {
        const container = input.closest(".container-input") || input.parentElement;
        const errorSpan = container.querySelector(".error") || container.querySelector(".fv-error");
        if (errorSpan) applyFeedback(input, container, errorSpan, validator(input.value));
      });
    });
  });

  document.querySelectorAll(".input-phone").forEach((inp) => initPhoneMask(inp));
  initPasswordToggle();
}

export function initPasswordResetForm() {
  const form = document.getElementById("form-password-reset");
  if (!form) return;

  const emailInput = form.querySelector("#input-email");
  if (emailInput) {
    let errorSpan = emailInput.parentElement.querySelector(".fv-error");
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "error fv-error";
      emailInput.after(errorSpan);
    }
    const wrapper = emailInput.closest("p") || emailInput.parentElement;
    if (!wrapper.classList.contains("container-input")) {
      wrapper.classList.add("container-input");
    }
  }

  const fieldDefs = [{ selector: "#input-email", validator: validators.email }];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid = validateFields(form, fieldDefs);
    if (valid) {
      form.dispatchEvent(new CustomEvent("fv:valid", { bubbles: true }));
    }
  });
}

export function initNewsletterForm(formSelector = ".newsletter-section form") {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  if (!emailInput) return;

  if (!emailInput.id) emailInput.id = "newsletter-email";
  emailInput.classList.add("input-newsletter-email");

  let wrapper = emailInput.closest(".container-input");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "container-input";
    emailInput.parentNode.insertBefore(wrapper, emailInput);
    wrapper.appendChild(emailInput);
  }

  let errorSpan = wrapper.querySelector(".error");
  if (!errorSpan) {
    errorSpan = document.createElement("span");
    errorSpan.className = "error";
    wrapper.appendChild(errorSpan);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = validators.newsletterEmail(emailInput.value);
    applyFeedback(emailInput, wrapper, errorSpan, result);

    if (result.isValid) {
      form.dispatchEvent(new CustomEvent("fv:valid", { bubbles: true }));
      errorSpan.innerHTML = `${SUCCESS_ICON} Cadastrado com sucesso!`;
      errorSpan.classList.add("fv-success-msg");
      emailInput.value = "";
      setTimeout(() => {
        errorSpan.innerHTML = "";
        errorSpan.classList.remove("fv-success-msg");
        emailInput.classList.remove("fv-valid");
        wrapper.classList.remove("fv-valid");
      }, 3000);
    }
  });

  emailInput.addEventListener("blur", () => {
    const result = validators.newsletterEmail(emailInput.value);
    applyFeedback(emailInput, wrapper, errorSpan, result);
  });
}

export function getProductFieldDefs() {
  return [
    { selector: '[name="name"], #product-name, .input-product-name', validator: validators.minLength(3) },
    { selector: '[name="price"], #product-price, .input-product-price', validator: validators.positiveNumber },
    { selector: '[name="stock"], #product-stock, .input-product-stock', validator: validators.positiveNumber },
    { selector: '[name="description"], #product-description, .input-product-description', validator: validators.minLength(10) },
    { selector: '[name="imageUrl"], #product-image, .input-product-image', validator: validators.imageUrl, optional: true },
  ];
}

export function initProductForm(scope, onValid, saveButton) {
  if (!scope) return;

  const fieldDefs = getProductFieldDefs();

  fieldDefs.forEach(({ selector }) => {
    const input = scope.querySelector(selector);
    if (!input) return;

    let container = input.closest(".container-input");
    if (!container) {
      container = input.parentElement;
      container.classList.add("container-input");
    }

    let errorSpan = container.querySelector(".error");
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "error";
      input.after(errorSpan);
    }

    input.addEventListener("blur", () => {
      const fieldDef = fieldDefs.find((fd) => input.matches(fd.selector));
      if (fieldDef) applyFeedback(input, container, errorSpan, fieldDef.validator(input.value));
    });
  });

  function runValidation() {
    const valid = validateFields(scope, fieldDefs);
    if (valid && typeof onValid === "function") onValid();
    return valid;
  }

  const form = scope.tagName === "FORM" ? scope : scope.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      runValidation();
    });
  }

  if (saveButton) {
    saveButton.addEventListener("click", (e) => {
      e.preventDefault();
      runValidation();
    });
  }
}
