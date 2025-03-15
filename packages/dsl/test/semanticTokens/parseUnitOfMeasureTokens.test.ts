import {describe, expect, it} from 'vitest'
import {parseCucinalistSemanticTokensDsl, ParsedToken} from '../../src'

describe('unitsOfMeasureTokens', () => {
  it('Minimal unit of measure', () => {
    const dsl = `unitOfMeasure item {
      measuring count
      defaultSymbol
    }`;
    const expectedTokens: ParsedToken[] = [
      {
        // unitOfMeasure
        tokenType: 'keyword',
        tokenModifiers: [],
        line: 0,
        length: 13,
        startCharacter: 0
      },
      {
        // item
        tokenType: 'type',
        tokenModifiers: ['declaration'],
        line: 0,
        length: 4,
        startCharacter: 14
      },
      {
        // measuring
        tokenType: 'keyword',
        tokenModifiers: [],
        line: 1,
        startCharacter: 6,
        length: 9,
      },
      {
        // count
        tokenType: 'label',
        tokenModifiers: [],
        line: 1,
        length: 5,
        startCharacter: 16,
      },
      {
        // defaultSymbol
        tokenType: 'keyword',
        tokenModifiers: [],
        line: 2,
        length: 13,
        startCharacter: 6
      }
    ];
    expect(parseCucinalistSemanticTokensDsl(dsl)).toMatchObject(expectedTokens);
  });

  it('Maximal unit of measure', () => {
    const dsl = `unitOfMeasure gram {
      measuring weight
      defaultSymbol g
      plural grams
      aka grammo, grammi, 'a thousand of a Kg'
    }`;
    const expectedTokens: ParsedToken[] = [
      {
        // unitOfMeasure
        tokenType: 'keyword',
        tokenModifiers: [],
        line: 0,
        length: 13,
        startCharacter: 0
      },
      {
        // gram
        tokenType: 'type',
        tokenModifiers: ['declaration'],
        line: 0,
        length: 4,
        startCharacter: 14
      },
      {
        // measuring
        tokenType: 'keyword',
        tokenModifiers: [],
        line: 1,
        startCharacter: 6,
        length: 9,
      },
      {
        // weight
        tokenType: 'label',
        tokenModifiers: [],
        line: 1,
        length: 6,
        startCharacter: 16,
      },
      {
        // defaultSymbol
        tokenType: 'keyword',
        tokenModifiers: [],
        line: 2,
        length: 13,
        startCharacter: 6
      },
      {
        // g
        tokenType: 'label',
        tokenModifiers: [],
        line: 2,
        length: 1,
        startCharacter: 20
      },
      {
        // plural
        tokenType: 'keyword',
        tokenModifiers: [],
        line: 3,
        length: 6,
        startCharacter: 6
      },
      {
        // grams
        tokenType: 'label',
        tokenModifiers: [],
        line: 3,
        length: 5,
        startCharacter: 13
      },
      {
        // aka
        tokenType: 'keyword',
        tokenModifiers: [],
        line: 4,
        length: 3,
        startCharacter: 6
      },
      {
        // grammo
        tokenType: 'label',
        tokenModifiers: [],
        line: 4,
        length: 6,
        startCharacter: 10
      },
      {
        // grammi
        tokenType: 'label',
        tokenModifiers: [],
        line: 4,
        length: 6,
        startCharacter: 18
      },
      {
        // a thousand of a Kg
        tokenType: 'label',
        tokenModifiers: [],
        line: 4,
        length: 18,
        startCharacter: 27
      }
    ];
    expect(parseCucinalistSemanticTokensDsl(dsl)).toMatchObject(expectedTokens);
  });
});
