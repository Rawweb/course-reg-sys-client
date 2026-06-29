// Given a full name, returns 2-character initials following this rule:
// - One word ("Philomina") -> first 2 characters of that word -> "PH"
// - Two or more words ("Chife Philomina") -> first letter of word 1 + first letter of word 2 -> "CP"
const getInitials = (fullName) => {
  if (!fullName) return '?';

  const words = fullName.trim().split(/\s+/); // split on any whitespace, handles extra spaces safely

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};

export default getInitials;
