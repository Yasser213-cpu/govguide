from django.core.validators import RegexValidator

password_validator = RegexValidator(
          regex=r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$',
          message=(
                  "Password must be at least 8 characters long and contain at least "
                   "one uppercase letter, one lowercase letter, one digit, and one special character."
                  ),
           )