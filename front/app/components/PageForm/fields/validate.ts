import { Multiloc, Locale } from 'typings';
import { isEmpty, some } from 'lodash-es';
import { validateSlug as validateSlugRegex } from 'utils/textUtils';

const filterMultiloc = (multiloc: Multiloc, localesToKeep: Locale[]) => {
  return Object.fromEntries(
    Object.entries(multiloc).filter(([locale]) =>
      localesToKeep.includes(locale as Locale)
    )
  );
};

const multilocValuesMissing = (multiloc: Multiloc) => {
  return isEmpty(multiloc) || some(multiloc, isEmpty);
};

export const validateMultiloc = (
  multiloc: Multiloc,
  localesToKeep: Locale[]
) => {
  const filteredMultiloc = filterMultiloc(multiloc, localesToKeep);

  if (multilocValuesMissing(filteredMultiloc)) {
    return [{ error: 'blank' }] as any;
  }

  return;
};

export const validateSlug = (slug?: string) => {
  if (slug && !validateSlugRegex(slug)) {
    return 'invalid_slug';
  }

  // This needs to be after invalid slug
  // because this error should overwrite the invalid_slug error
  if (typeof slug === 'string' && slug.length === 0) {
    return 'empty_slug';
  }

  return;
};

export const removeUndefined = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).reduce((acc, [key, value]) => {
      return value === undefined ? acc : [...acc, [key, value]];
    }, [])
  );
};
