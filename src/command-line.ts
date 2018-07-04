import commandLineArgs from 'command-line-args';
import getUsage from 'command-line-usage';
import { difference } from 'lodash';

import { printError } from './print-error';

export const supportedLanguages = [
  'en-AU',
  'en-CA',
  'en-GB',
  'en-US',
  'en-ZA',
];

export const addPlugins = [
  'spell',
  'indefinite-article',
  'repeated-words',
];

export const removePlugins = [
  'syntax-mentions',
  'syntax-urls',
];

export const supportedPlugins = addPlugins.concat(removePlugins);

export const defaultPlugins = [
  'spell',
  'indefinite-article',
  'repeated-words',
  'syntax-mentions',
  'syntax-urls',
];

// tslint:disable:max-line-length
const optionList = [
  {
    alias: 'f',
    defaultOption: true,
    description: 'A list of files or globs to spellcheck.',
    multiple: true,
    name: 'files',
    typeLabel: '<file|glob> <file|glob>...',
  },
  {
    alias: 'l',
    defaultValue: 'en-US',
    description: `The language of the files. The default language is en-US. The following languages are supported: ${supportedLanguages.join(', ')}.`,
    name: 'language',
    typeLabel: '<language>',
  },
  {
    alias: 'd',
    defaultValue: [],
    description: 'Files to combine into a personal dictionary.',
    multiple: true,
    name: 'dictionaries',
    typeLabel: '<file> <file>...',
  },
  {
    description: 'Write a personal dictionary that contains all found misspellings to dictionary.txt.',
    name: 'generate-dictionary',
    type: Boolean,
  },
  {
    alias: 'i',
    defaultValue: [],
    description: 'Spelling mistakes that match any of these regexes (after being wrapped with ^ and $) will be ignored.',
    multiple: true,
    name: 'ignore',
    typeLabel: '<regex> <regex>...',
  },
  {
    alias: 'p',
    defaultValue: defaultPlugins,
    description: `A list of retext plugins to use. The default is "${defaultPlugins.join(' ')}". The following plugins are supported: ${supportedPlugins.join(', ')}.`,
    multiple: true,
    name: 'plugins',
    typeLabel: '<name> <name>...',
  },
  {
    description: 'Do not print suggested replacements for misspelled words. This option will improve Spellchecker\'s runtime when many errors are detected.',
    name: 'no-suggestions',
    type: Boolean,
  },
  {
    alias: 'q',
    description: 'Do not output anything for files that contain no spelling mistakes.',
    name: 'quiet',
    type: Boolean,
  },
  {
    alias: 'h',
    description: 'Print this help screen.',
    name: 'help',
    type: Boolean,
  },
];
// tslint:enable:max-line-length

const usage = getUsage([
  {
    content: 'A command-line tool for spellchecking files.',
    header: 'spellchecker',
  },
  {
    header: 'Options',
    optionList,
  },
]);

const getSpellcheckerUsage = () => usage;
export { getSpellcheckerUsage as getUsage };

export function parseArgs() {
  let parsedArgs;

  try {
    parsedArgs = commandLineArgs(optionList);
  } catch (error) {
    printError(error.toString());
    console.log(usage);
    process.exit(1);
  }

  const {
    files,
    language,
    plugins,
    dictionaries: personalDictionaryPaths,
    ignore: ignoreRegexStrings,
    quiet,
    help,
  } = parsedArgs;
  const generateDictionary = parsedArgs['generate-dictionary'];
  const suggestions = !parsedArgs['no-suggestions'];

  if (help) {
    console.log(usage);
    process.exit(0);
  }

  if (!files || files.length === 0) {
    printError('A list of files is required.');
    console.log(usage);
    process.exit(1);
  }

  if (!supportedLanguages.includes(language)) {
    printError(`The language "${language}" is not supported.`);
    console.log(usage);
    process.exit(1);
  }

  const unsupportedPlugins = difference(plugins, supportedPlugins);
  if (unsupportedPlugins.length > 0) {
    printError(`The following retext plugins are not supported: ${unsupportedPlugins.join(', ')}.`);
    console.log(usage);
    process.exit(1);
  }

  const ignoreRegexes = ignoreRegexStrings.map((regexString) => new RegExp(`^${regexString}$`));

  return {
    files,
    generateDictionary,
    ignoreRegexes,
    language,
    personalDictionaryPaths,
    plugins,
    quiet,
    suggestions,
  };
}
