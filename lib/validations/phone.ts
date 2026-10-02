// Checkout and the profile page share this rule so a number accepted in one place is never rejected in the other.
export const PHONE_PATTERN = /^\+?[0-9 ]{10,16}$/
export const PHONE_MESSAGE = 'Please enter a valid phone number.'