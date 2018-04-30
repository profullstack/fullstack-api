function validateEmail(email, messages) {
  const result = {
    isValid: false
  };

  if (email && email.length > 6 && /.@.+\..+/.test(email)) {
    result.isValid = true;
  }

  if (!result.isValid) {
    messages.push({
      field: 'email',
      message: 'Email is not valid'
    });
  }

  return messages;
}

function validate(data) {
  let messages = [];

  messages = validateEmail(data.email, messages);

  return messages;
}

exports default {
  validate
};

