/**
 * Regex is taken from https://github.com/kripod/otion/blob/main/packages/otion/src/propertyMatchers.ts.
 * Great thanks to Kripod for taking the time to write this.
 */

const PROPERTIES_CORRECTION_GROUPS = /^(?:([tlbr].{2,4}m?$|c.{7}$)|([fl].{5}l|g.{8}$|pl))/;

// ?left || ?right || ?top || ?bottom || || flex-[!flow] || transition-? || font-? || background-? || animation || grid-?
const PROPERTIES_THAT_NEED_CORRECTION = /(-le|-ri|-to|ot|x-[b|d|g|sw]|nsit|-fo|-mar|ckg|ani|gr|al|bor|^ju|ion-|!^pl)/;

/**
 * :hover || :active || :focus | :focus-visible | :read-only | :disabled
 */
const PSEUDO_SPECIFICITY = /(:h)|(:ac)|(:fo)|(:read-o)|(:d)/g;

const getPrecedence = (property: string, selector: string) => {
  let precedence = 1;

  const correction = PROPERTIES_CORRECTION_GROUPS.exec(property) || [];
  const higherSpecificity = correction[1];
  const lowerSpecificity = correction[2];
  const needsSpecificity = PROPERTIES_THAT_NEED_CORRECTION.exec(property);
  const combinedOfWordsLength = property.match(/-/g);

  /**
   * Find specificity for a pseudo string
   */
  let pseudoSpecificityResult = PSEUDO_SPECIFICITY.exec(selector);
  let runner = PSEUDO_SPECIFICITY.exec(selector);
  while (runner !== null) {
    const regexResult = PSEUDO_SPECIFICITY.exec(selector);
    if (regexResult) {
      pseudoSpecificityResult = regexResult;
    }
    runner = regexResult;
  }
  /**
   * Filters relevant groups from array and find the first value not undefined
   */
  const pseudoSpecificity = (pseudoSpecificityResult ?? [])
    .slice(1, 6)
    .findIndex((el) => !!el);

  const usePrecedence = !!(needsSpecificity && combinedOfWordsLength);

  if (usePrecedence) {
    precedence +=
      ((needsSpecificity && combinedOfWordsLength) || []).length +
      (higherSpecificity ? 1 : 0) -
      (lowerSpecificity ? 1 : 0) +
      Math.max(pseudoSpecificity, 0);
  }

  return precedence;
};

export default getPrecedence;
