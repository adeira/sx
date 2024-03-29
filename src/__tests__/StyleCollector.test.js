// @flow

import StyleCollector from '../StyleCollector';

afterEach(() => {
  StyleCollector.reset();
});

it('works with simple styles', () => {
  expect(
    StyleCollector.collect({
      test: { color: 'blue' },
      lol: {
        fontSize: 16,
        color: 'blue',
      },
    }),
  ).toMatchInlineSnapshot(`
    {
      "hashRegistry": Map {
        "test" => Map {
          "color" => "_2dHaKY",
        },
        "lol" => Map {
          "font-size" => "_39Fbhf",
          "color" => "_2dHaKY",
        },
      },
      "styleBuffer": Map {
        "_2dHaKY" => StyleCollectorNode {
          "hash": "_2dHaKY",
          "styleName": "color",
          "styleValue": "#00f",
        },
        "_39Fbhf" => StyleCollectorNode {
          "hash": "_39Fbhf",
          "styleName": "font-size",
          "styleValue": "16px",
        },
      },
    }
  `);
});

it('works with pseudo styles', () => {
  expect(
    StyleCollector.collect({
      lol: {
        'fontSize': 16,
        'color': 'blue',
        ':hover': {
          color: 'pink',
          textDecoration: 'underline',
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
      "hashRegistry": Map {
        "lol" => Map {
          "font-size" => "_39Fbhf",
          "color" => "_2dHaKY",
          "color:hover" => "_2sykgO",
          "text-decoration:hover" => "crve5",
        },
      },
      "styleBuffer": Map {
        "_39Fbhf" => StyleCollectorNode {
          "hash": "_39Fbhf",
          "styleName": "font-size",
          "styleValue": "16px",
        },
        "_2dHaKY" => StyleCollectorNode {
          "hash": "_2dHaKY",
          "styleName": "color",
          "styleValue": "#00f",
        },
        ":hover" => StyleCollectorPseudoNode {
          "nodes": Map {
            "_2sykgO" => StyleCollectorNode {
              "hash": "_2sykgO",
              "styleName": "color",
              "styleValue": "#ffc0cb",
            },
            "crve5" => StyleCollectorNode {
              "hash": "crve5",
              "styleName": "text-decoration",
              "styleValue": "underline",
            },
          },
          "pseudo": ":hover",
        },
      },
    }
  `);
});

it('works with mediaQueries', () => {
  expect(
    StyleCollector.collect({
      test: {
        '@media (min-width: 900px)': {
          color: 'blue',
        },
      },

      nestedMedia: {
        '@media print': {
          'color': 'red',
          '@media (max-width: 12cm)': {
            color: 'blue',
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
      "hashRegistry": Map {
        "test" => Map {
          "color@media (min-width: 900px)" => "_1iHvvo",
        },
        "nestedMedia" => Map {
          "color@media print" => "O347H",
          "color@media (max-width: 12cm)" => "_3XWcpy",
        },
      },
      "styleBuffer": Map {
        "@media (min-width: 900px)" => StyleCollectorAtNode {
          "atRuleName": "@media (min-width: 900px)",
          "nodes": Map {
            "_1iHvvo" => StyleCollectorNode {
              "hash": "_1iHvvo",
              "styleName": "color",
              "styleValue": "#00f",
            },
          },
        },
        "@media print" => StyleCollectorAtNode {
          "atRuleName": "@media print",
          "nodes": Map {
            "O347H" => StyleCollectorNode {
              "hash": "O347H",
              "styleName": "color",
              "styleValue": "#f00",
            },
            "@media (max-width: 12cm)" => StyleCollectorAtNode {
              "atRuleName": "@media (max-width: 12cm)",
              "nodes": Map {
                "_3XWcpy" => StyleCollectorNode {
                  "hash": "_3XWcpy",
                  "styleName": "color",
                  "styleValue": "#00f",
                },
              },
            },
          },
        },
      },
    }
  `);
});

it('works with keyframes', () => {
  expect(
    StyleCollector.addKeyframe('_1kFWtB', `@keyframes _1kFWtB {from {opacity: 0}to {opacity:1}}`),
  ).toBe(false);

  expect(
    StyleCollector.addKeyframe('_1kFWtB', `@keyframes _1kFWtB {from {opacity: 0}to {opacity:1}}`),
  ).toBe(true);
});
