import { toDictionary } from '../src/to-dictionary';

import { buildVfile, fileWithNoMessages } from './helpers/vfile';

const addNewlines = (strings) => strings.map((s) => `${s}\n`).join('');

describe('toDictionary', () => {
  it('returns an empty string when passed an empty array', () => {
    toDictionary([]).should.equal('');
  });

  it('returns an empty string when passed a list of vfiles with no messages', () => {
    toDictionary([
      fileWithNoMessages,
      fileWithNoMessages,
      fileWithNoMessages,
    ]).should.equal('');
  });

  it('returns a sorted list of messages', () => {
    toDictionary([
      buildVfile(['c', 'e']),
      buildVfile(['b']),
      buildVfile(['a', 'd']),
    ]).should.equal(addNewlines(['a', 'b', 'c', 'd', 'e']));
  });

  it('returns a deduplicated list of messages', () => {
    toDictionary([
      buildVfile(['a', 'b']),
      buildVfile(['b', 'c']),
      buildVfile(['c', 'a']),
    ]).should.equal(addNewlines(['a', 'b', 'c']));
  });

  it('only includes messages from retext-spell', () => {
    toDictionary([
      buildVfile(['a', 'b']),
      {
        messages: [
          { source: 'asdf', actual: 'c' },
          { source: 'asdf', actual: 'd' },
          { source: 'retext-spell', actual: 'e' },
        ],
      },
    ]).should.equal(addNewlines(['a', 'b', 'e']));
  });

  it('ignores overflow messages from retext-spell', () => {
    toDictionary([
      {
        messages: [
          { source: 'retext-spell', ruleId: 'retext-spell', actual: 'a' },
          { source: 'retext-spell', ruleId: 'overflow', actual: 'b' },
        ],
      },
    ]).should.equal('a\n');
  });
});
