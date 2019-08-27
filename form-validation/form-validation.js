function isAnyOptionSelected(id) {
  const radioGroup = document.getElementById(`radioGroup-${id}`);
  const isRequired = parseFloat(radioGroup.getAttribute('data-required'));

  if (isRequired) {
    const radioInputs = document.getElementsByName(id);
    // filter out the selected radio inputs
    radioInputs.filter(input => input.checked);
  } else {
    // return true because the field isn't required
    return true;
  }

  return !!radioInputs.length;
}

export default function validateForm(inputs, selects) {
  // create empty errors array
  const errors = [];

  return new Promise((resolve, reject) => {
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      // check for the data-required attribute
      const isRequired = input.getAttribute('data-required') === 'true';

      switch (input.type) {
        case 'checkbox':
          if (isRequired && !input.checked) {
            errors.push({ element: input.id, message: 'Please confirm by checking this field' });
          }
          break;
        case 'radio':
          // check if a radio option has been selected
          if (!isAnyOptionSelected(input.name)) {
            errors.push({ element: input.name, message: 'Please select an option' });
          }
        case 'tel':
          // remove spaces
          const value = input.value.replace(' ', '');
          if (value[0] !== '0' || value.length !== 11) {
            errors.push({ element: input.name, message: 'Please enter a valid phone number' });
          }
        default:
          // by default assume input is text or textarea
          if (isRequired && !input.value) {
            errors.push({ element: input.name, message: 'Please fill out this required field' });
          }
          break;
      }
    }

    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const isRequired = select.getAttribute('data-required') === 'true';

      const selectedOption = select.options[select.selectedIndex].value;
      if (isRequired && selectedOption === 'default') {
        errors.push({ element: select.id, message: 'Please select an option' });
      }
    }

    if (errors.length) {
      reject(errors);
    } else {
      resolve();
    }
  });
}
